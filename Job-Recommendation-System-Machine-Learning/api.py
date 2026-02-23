from pathlib import Path
import pickle
import re
from typing import List, Optional

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

ROOT = Path(__file__).resolve().parent
DF_PATH = ROOT / "df.pkl"
SIM_PATH = ROOT / "similarity.pkl"
CSV_PATH = ROOT / "Combined_Jobs_Final.csv"

app = FastAPI(title="Job Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

_df_cache = None
_similarity_cache = None
_df_from_pickle = False


def _load_df():
    global _df_cache, _df_from_pickle
    if _df_cache is None:
        try:
            _df_cache = pickle.load(open(DF_PATH, "rb"))
            _df_from_pickle = True
        except Exception:
            if not CSV_PATH.exists():
                raise
            _df_cache = pd.read_csv(CSV_PATH)
            _df_from_pickle = False
    return _df_cache


def _load_similarity():
    global _similarity_cache
    if _similarity_cache is None:
        _similarity_cache = pickle.load(open(SIM_PATH, "rb"))
    return _similarity_cache


def _normalize(text: str) -> str:
    return re.sub(r"[^a-z0-9\s]", " ", text.lower()).strip()


def _safe_get(row, key):
    return row.get(key) if isinstance(row, dict) else getattr(row, key, "")


def _skill_scores(df: pd.DataFrame, skills: List[str]):
    tokens = [_normalize(skill) for skill in skills if skill and skill.strip()]
    tokens = [token for token in tokens if token]
    if not tokens:
        return []

    def combined_text(row):
        return " ".join([
            str(row.get("Title", "")),
            str(row.get("Position", "")),
            str(row.get("Company", "")),
            str(row.get("Job.Description", "")),
            str(row.get("Location", "")),
            str(row.get("EmploymentType", "")),
            str(row.get("Level", "")),
            str(row.get("Salary", "")),
            " ".join(row.get("Tags", []) or []),
        ]).lower()

    scores = []
    for idx, row in df.iterrows():
        text = combined_text(row)
        score = sum(1 for token in tokens if token in text)
        scores.append((idx, score))

    return sorted(scores, key=lambda item: item[1], reverse=True)


class JobInput(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    employmentType: Optional[str] = None
    level: Optional[str] = None
    salary: Optional[str] = None
    tags: Optional[List[str]] = None


class RecommendationRequest(BaseModel):
    skills: List[str] = []
    limit: int = 10
    jobs: Optional[List[JobInput]] = None


class StudentFeature(BaseModel):
    studentId: str
    completedCount: int = 0
    avgRating: float = 0
    responseHours: float = 72
    rehireRate: float = 0


class RankingRequest(BaseModel):
    students: List[StudentFeature] = []


class RankedStudent(BaseModel):
    studentId: str
    score: float
    completedCount: int
    avgRating: float
    responseHours: float
    rehireRate: float


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"status": "ok", "message": "Job Recommendation API"}


@app.post("/recommendations")
def recommendations(payload: RecommendationRequest):
    limit = max(1, min(payload.limit, 50))

    if payload.jobs is None or len(payload.jobs) == 0:
        return {"recommendations": []}

    jobs_rows = []
    for job in payload.jobs:
        jobs_rows.append({
            "Id": job.id or "",
            "Title": job.title or "",
            "Company": job.company or "",
            "Job.Description": job.description or "",
            "Location": job.location or "",
            "EmploymentType": job.employmentType or "",
            "Level": job.level or "",
            "Salary": job.salary or "",
            "Tags": job.tags or [],
        })

    jobs_df = pd.DataFrame(jobs_rows)
    scored = _skill_scores(jobs_df, payload.skills)
    results = []
    for idx, score in scored[:limit]:
        row = jobs_df.iloc[idx].to_dict()
        results.append({
            "id": row.get("Id", ""),
            "title": row.get("Title", ""),
            "company": row.get("Company", ""),
            "description": row.get("Job.Description", ""),
            "location": row.get("Location", ""),
            "employmentType": row.get("EmploymentType", ""),
            "level": row.get("Level", ""),
            "salary": row.get("Salary", ""),
            "score": float(score),
        })

    return {"recommendations": results}


@app.post("/student-rankings")
def student_rankings(payload: RankingRequest):
    def compute_score(item: StudentFeature) -> float:
        completed_norm = min(item.completedCount / 20, 1)
        rating_norm = min(item.avgRating / 5, 1)
        response_norm = 1 - min(item.responseHours / 72, 1)
        rehire_norm = min(item.rehireRate, 1)
        score = (
            0.45 * completed_norm
            + 0.35 * rating_norm
            + 0.10 * response_norm
            + 0.10 * rehire_norm
        )
        return round(score * 100, 2)

    ranked = []
    for student in payload.students:
        ranked.append(
            RankedStudent(
                studentId=student.studentId,
                score=compute_score(student),
                completedCount=student.completedCount,
                avgRating=student.avgRating,
                responseHours=student.responseHours,
                rehireRate=student.rehireRate,
            )
        )

    ranked.sort(key=lambda item: item.score, reverse=True)
    return {"ranked": [item.dict() for item in ranked]}
