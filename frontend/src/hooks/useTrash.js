import { useContext } from "react";
import { TrashContext } from "../context/TrashContext";

const useTrash = () => {
  const context = useContext(TrashContext);
  if (!context) {
    throw new Error("useTrash must be used within TrashProvider");
  }
  return context;
};

export default useTrash;
