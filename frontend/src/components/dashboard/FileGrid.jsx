import FileCard from "./FileCard";
import FileListItem from "./FileListItem";

const FileGrid = ({ files, onDelete, onMove, onDownload, onFileClick, viewMode = "grid", emptyMessage, emptyHint }) => {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-16 h-16 text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p className="text-white font-medium">{emptyMessage || "No files found"}</p>
        <p className="text-zinc-400 text-sm mt-1">{emptyHint || "Upload a file to get started"}</p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="grid gap-2">
        {files.map((file) => (
          <FileListItem
            key={file._id}
            file={file}
            onDelete={onDelete}
            onMove={onMove}
            onDownload={onDownload}
            onClick={() => onFileClick?.(file)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <FileCard
          key={file._id}
          file={file}
          onDelete={onDelete}
          onMove={onMove}
          onFileClick={() => onFileClick?.(file)}
        />
      ))}
    </div>
  );
};

export default FileGrid;
