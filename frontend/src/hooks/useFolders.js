import { useContext } from "react";
import { FolderContext } from "../context/FolderContext";

const useFolders = () => {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error("useFolders must be used within a FolderProvider");
  }
  return context;
};

export default useFolders;
