const natural = require("natural");

const tokenizer = new natural.WordTokenizer();

const buildJobText = (job) => {
    const tags = Array.isArray(job.tags) ? job.tags.join(" ") : "";
    return [
        job.title,
        job.description,
        tags,
        job.companyName,
        job.location,
        job.employmentType,
        job.level,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
};

const toVectorMap = (terms) => {
    const map = new Map();
    terms.forEach((term) => {
        map.set(term.term, term.tfidf);
    });
    return map;
};

const cosineSimilarity = (vecA, vecB) => {
    let dot = 0;
    let magA = 0;
    let magB = 0;

    vecA.forEach((value, key) => {
        magA += value * value;
        const bVal = vecB.get(key);
        if (bVal) dot += value * bVal;
    });

    vecB.forEach((value) => {
        magB += value * value;
    });

    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

const buildQueryVector = (skills) => {
    const tokens = tokenizer
        .tokenize(skills.join(" ").toLowerCase())
        .filter((token) => token.length > 1);

    const counts = new Map();
    tokens.forEach((token) => {
        counts.set(token, (counts.get(token) || 0) + 1);
    });

    const total = tokens.length || 1;
    const vector = new Map();
    counts.forEach((count, token) => {
        vector.set(token, count / total);
    });

    return vector;
};

let cachedModel = {
    hash: "",
    tfidf: null,
    vectors: [],
    jobs: [],
    builtAt: 0,
};

const buildModel = (jobs) => {
    const tfidf = new natural.TfIdf();
    const documents = jobs.map(buildJobText);
    documents.forEach((doc) => tfidf.addDocument(doc));

    const vectors = jobs.map((_, idx) => toVectorMap(tfidf.listTerms(idx)));

    cachedModel = {
        hash: jobs.map((job) => `${job._id}-${job.updatedAt || ""}`).join("|"),
        tfidf,
        vectors,
        jobs,
        builtAt: Date.now(),
    };

    return cachedModel;
};

const getModel = (jobs) => {
    const hash = jobs.map((job) => `${job._id}-${job.updatedAt || ""}`).join("|");
    if (cachedModel.hash !== hash || Date.now() - cachedModel.builtAt > 5 * 60 * 1000) {
        return buildModel(jobs);
    }
    return cachedModel;
};

const getContentRecommendations = (skills, jobs, limit = 6) => {
    if (!Array.isArray(skills) || skills.length === 0) return [];
    if (!Array.isArray(jobs) || jobs.length === 0) return [];

    const { vectors } = getModel(jobs);
    const queryVector = buildQueryVector(skills);

    const scored = jobs
        .map((job, index) => ({
            job,
            score: cosineSimilarity(vectors[index], queryVector),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return scored;
};

module.exports = {
    getContentRecommendations,
};
