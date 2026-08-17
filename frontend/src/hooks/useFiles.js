import { useContext } from "react";
import { FileContext } from "../context/FileContext";

const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFiles must be used within a FileProvider");
  }
  return context;
};

export default useFiles;
