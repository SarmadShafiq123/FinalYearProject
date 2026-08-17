import { createContext, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  createFolder as apiCreateFolder,
  getFolders as apiGetFolders,
  renameFolder as apiRenameFolder,
  deleteFolder as apiDeleteFolder,
  moveFileToFolder as apiMoveFileToFolder,
} from "../api/folder.api";

const FolderContext = createContext(null);

const FolderProvider = ({ children }) => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGetFolders();
      setFolders(res.data.data.folders);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFolder = async (name, parentFolder) => {
    try {
      const res = await apiCreateFolder(name, parentFolder);
      const newFolder = res.data.data.folder;
      setFolders((prev) => [newFolder, ...prev]);
      toast.success("Folder created");
      return newFolder;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create folder");
      throw err;
    }
  };

  const renameFolder = async (id, name) => {
    try {
      const res = await apiRenameFolder(id, name);
      const updatedFolder = res.data.data.folder;
      setFolders((prev) => prev.map((f) => (f._id === id ? updatedFolder : f)));
      toast.success("Folder renamed");
      return updatedFolder;
    } catch (err) {
      toast.error("Failed to rename folder");
      throw err;
    }
  };

  const deleteFolder = async (id) => {
    try {
      await apiDeleteFolder(id);
      setFolders((prev) => prev.filter((f) => f._id !== id));
      toast.success("Folder deleted");
    } catch (err) {
      toast.error("Failed to delete folder");
      throw err;
    }
  };

  const moveFile = async (fileId, folderId) => {
    const res = await apiMoveFileToFolder(fileId, folderId);
    return res.data.data.file;
  };

  return (
    <FolderContext.Provider
      value={{
        folders,
        loading,
        fetchFolders,
        createFolder,
        renameFolder,
        deleteFolder,
        moveFile,
      }}
    >
      {children}
    </FolderContext.Provider>
  );
};

export { FolderContext, FolderProvider };
