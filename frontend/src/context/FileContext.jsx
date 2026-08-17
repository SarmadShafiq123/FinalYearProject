import { createContext, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  fetchFiles as apiFetchFiles,
  uploadFile as apiUploadFile,
  deleteFile as apiDeleteFile,
  moveFile as apiMoveFile,
  downloadFile as apiDownloadFile,
} from "../api/file.api";

const FileContext = createContext(null);

const FileProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState("root");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("idle");
  const [downloadStage, setDownloadStage] = useState("idle");

  const fetchFiles = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await apiFetchFiles(params);
      setFiles(res.data.data.files);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = async (formData) => {
    setUploadProgress(0);
    setUploadStage("uploading");
    toast.loading("Uploading file...", { id: "upload" });

    try {
      const res = await apiUploadFile(formData, (percent) => {
        setUploadProgress(percent);
        if (percent <= 40) {
          setUploadStage("uploading");
        } else if (percent <= 70) {
          setUploadStage("encrypting");
        } else if (percent <= 95) {
          setUploadStage("storing");
        } else {
          setUploadStage("success");
        }
      });

      const newFile = res.data.data.file;
      setFiles((prev) => [newFile, ...prev]);
      setUploadProgress(100);
      setUploadStage("success");
      toast.success("File uploaded successfully", { id: "upload" });

      const user = res.data.data.user;
      if (user && user.storageLimit) {
        const usagePercent = (user.storageUsed / user.storageLimit) * 100;
        if (usagePercent >= 90) {
          toast("Storage almost full! You have used 90%+ of your storage.", {
            icon: "⚠️",
            style: {
              background: "#18181b",
              color: "#facc15",
              border: "1px solid #854d0e",
            },
            duration: 5000,
          });
        }
      }

      setTimeout(() => {
        setUploadProgress(0);
        setUploadStage("idle");
      }, 2000);

      return newFile;
    } catch (err) {
      setUploadStage("error");
      if (err.response?.status === 413 || err.response?.data?.message?.toLowerCase().includes("storage")) {
        toast.error("Storage limit exceeded. You cannot upload more files.", { id: "upload" });
      } else {
        toast.error(err.response?.data?.message || "Upload failed", { id: "upload" });
      }
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStage("idle");
      }, 3000);
      throw err;
    }
  };

  const deleteFile = async (id) => {
    try {
      await apiDeleteFile(id);
      setFiles((prev) => prev.filter((f) => f._id !== id));
      toast.success("File moved to trash");
    } catch (err) {
      toast.error("Failed to delete file");
      throw err;
    }
  };

  const moveFile = async (id, folder) => {
    try {
      const res = await apiMoveFile(id, folder);
      const updatedFile = res.data.data.file;
      setFiles((prev) => prev.map((f) => (f._id === id ? updatedFile : f)));
      toast.success("File moved successfully");
      return updatedFile;
    } catch (err) {
      toast.error("Failed to move file");
      throw err;
    }
  };

  const downloadFile = async (file) => {
    setDownloadStage("fetching");
    toast.loading("Preparing download...", { id: "download" });

    try {
      const res = await apiDownloadFile(file._id);

      setDownloadStage("decrypting");

      await new Promise((resolve) => setTimeout(resolve, 300));

      setDownloadStage("downloading");

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setDownloadStage("complete");
      toast.success("Download started", { id: "download" });

      setTimeout(() => {
        setDownloadStage("idle");
      }, 2000);
    } catch (err) {
      setDownloadStage("idle");
      toast.error("Download failed", { id: "download" });
      throw err;
    }
  };

  return (
    <FileContext.Provider
      value={{
        files,
        loading,
        currentFolder,
        setCurrentFolder,
        uploadProgress,
        uploadStage,
        downloadStage,
        fetchFiles,
        uploadFile,
        deleteFile,
        moveFile,
        downloadFile,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export { FileContext, FileProvider };
