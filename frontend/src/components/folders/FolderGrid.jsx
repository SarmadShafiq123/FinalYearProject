import FolderCard from "./FolderCard";

const FolderGrid = ({ folders, onRename, onDelete, onClick, emptyMessage }) => {
  if (folders.length === 0) {
    if (!emptyMessage) {
      return null;
    }

    return (
      <div className="bg-zinc-900/60 border border-dashed border-zinc-800 rounded-lg px-4 py-6 mb-6 text-center">
        <p className="text-sm font-medium text-white">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {folders.map((folder) => (
        <FolderCard
          key={folder._id}
          folder={folder}
          onRename={onRename}
          onDelete={onDelete}
          onClick={onClick}
        />
      ))}
    </div>
  );
};

export default FolderGrid;
