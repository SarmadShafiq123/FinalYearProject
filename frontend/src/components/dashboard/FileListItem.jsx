import formatBytes from "../../utils/formatBytes";

const categoryIcons = {
  image: (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  video: (
    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  audio: (
    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  archive: (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  other: (
    <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
};

const FileListItem = ({ file, onDelete, onDownload, onMove, onClick }) => {
  const icon = categoryIcons[file.category] || categoryIcons.other;
  const date = new Date(file.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div 
      className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center gap-4 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors cursor-pointer"
      onClick={() => onClick?.()}
    >
      <div className="flex-shrink-0">{icon}</div>
      
      <p className="text-white text-sm flex-1 min-w-0 truncate hover:text-blue-400 transition-colors" title={file.originalName}>
        {file.originalName}
      </p>
      
      <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded capitalize flex-shrink-0">
        {file.category}
      </span>
      
      <span className="text-zinc-400 text-sm w-20 text-right flex-shrink-0">
        {formatBytes(file.size)}
      </span>
      
      <span className="text-zinc-400 text-sm w-32 text-right flex-shrink-0">
        {date}
      </span>
      
      {file.isEncrypted && (
        <span className="text-zinc-500 text-xs w-8 text-center flex-shrink-0">
          🔒
        </span>
      )}
      
      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onClick?.()}
          className="p-1.5 rounded hover:bg-zinc-800 transition-colors text-blue-400 hover:text-blue-300 cursor-pointer"
          aria-label={`View details for ${file.originalName}`}
          title="View Details"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        <button
          onClick={() => onDownload(file)}
          className="p-1.5 rounded hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white cursor-pointer"
          aria-label={`Download ${file.originalName}`}
          title="Download"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
        
        <button
          onClick={() => onMove(file)}
          className="p-1.5 rounded hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white cursor-pointer"
          aria-label={`Move ${file.originalName}`}
          title="Move"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>
        
        <button
          onClick={() => onDelete(file._id)}
          className="p-1.5 rounded hover:bg-zinc-800 transition-colors text-red-400 hover:text-red-300 cursor-pointer"
          aria-label={`Delete ${file.originalName}`}
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FileListItem;
