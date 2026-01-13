import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, logoutUser, uploadProfileImage, removeProfileImage } from "../api/authApi";
import { removeToken } from "../utils/auth";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const navigate = useNavigate();

  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const backendOrigin = apiBase.replace(/\/api\/?$/, "");
  const profileImageUrl = user?.profileImage ? `${backendOrigin}${user.profileImage}` : "";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setUser(res.data);
      } catch (err) {
        setError("Failed to load profile");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleUpload = async () => {
    if (!selectedImage) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      const res = await uploadProfileImage(formData);
      setUser((prev) => ({
        ...(prev || {}),
        profileImage: res.data.profileImage,
      }));
      setSelectedImage(null);
      window.dispatchEvent(new Event("profile-updated"));
    } catch (e) {
      setUploadError(e.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setUploading(true);
    setUploadError("");
    try {
      await removeProfileImage();
      setUser((prev) => ({
        ...(prev || {}),
        profileImage: "",
      }));
      window.dispatchEvent(new Event("profile-updated"));
    } catch (e) {
      setUploadError(e.response?.data?.message || "Failed to remove image");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      // ignore
    } finally {
      removeToken();
      window.location.href = "/";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgLight dark:bg-darkBg">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgLight dark:bg-darkBg">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgLight dark:bg-darkBg">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-3xl font-bold text-textDark dark:text-darkText mb-2">Profile</h2>
          <p className="text-textDark/70 dark:text-darkText/70">Your account details</p>
        </div>

        <div className="bg-inputBg dark:bg-darkCard rounded-xl shadow-md p-6">
          <div className="mb-8 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-accent/30 dark:bg-darkBorder overflow-hidden flex items-center justify-center">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-textDark/70 dark:text-darkText/70 mb-2">Profile Image</p>
              <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-textDark dark:text-darkText file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-secondary"
                />
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedImage || uploading}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={!user?.profileImage || uploading}
                  className="bg-light dark:bg-darkBorder text-textDark dark:text-darkText px-6 py-2 rounded-lg hover:bg-accent/30 dark:hover:bg-accent/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
              {uploadError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {uploadError}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-textDark/70 dark:text-darkText/70">Email</p>
              <p className="text-lg font-semibold text-textDark dark:text-darkText break-all">{user?.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-textDark/70 dark:text-darkText/70">Role</p>
              <p className="text-lg font-semibold text-textDark dark:text-darkText">{user?.role || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-textDark/70 dark:text-darkText/70">Name</p>
              <p className="text-lg font-semibold text-textDark dark:text-darkText">{user?.name || user?.fullName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-textDark/70 dark:text-darkText/70">Joined</p>
              <p className="text-lg font-semibold text-textDark dark:text-darkText">{user?.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</p>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button onClick={handleLogout} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
