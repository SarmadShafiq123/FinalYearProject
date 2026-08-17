import TrashCard from "./TrashCard";

const TrashGrid = ({ files, onRestore, onDelete }) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-400 text-sm">Trash is empty</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {files.map((file) => (
        <TrashCard key={file._id} file={file} onRestore={onRestore} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default TrashGrid;
