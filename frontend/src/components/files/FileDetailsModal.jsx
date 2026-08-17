import { useState, useEffect } from "react";
import { X, Download, Trash2, FileText, Music, Video, Image as ImageIcon, Archive, Copy, Check } from "lucide-react";

const FileDetailsModal = ({ isOpen, onClose, file, onDelete, onDownload }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes, k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (category) => {
    const iconClass = "w-12 h-12";
    const colorClass = {
      document: "text-blue-400",
      image: "text-green-400",
      video: "text-purple-400",
      audio: "text-yellow-400",
      archive: "text-orange-400",
      other: "text-gray-400",
    };

    const color = colorClass[category] || colorClass.other;

    switch (category) {
      case "document":
        return <FileText className={`${iconClass} ${color}`} />;
      case "image":
        return <ImageIcon className={`${iconClass} ${color}`} />;
      case "video":
        return <Video className={`${iconClass} ${color}`} />;
      case "audio":
        return <Music className={`${iconClass} ${color}`} />;
      case "archive":
        return <Archive className={`${iconClass} ${color}`} />;
      default:
        return <FileText className={`${iconClass} ${color}`} />;
    }
  };

  const renderPreview = () => {
    if (!file) return null;

    // Image preview
    if (file.category === "image") {
      return (
        <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center" style={{ height: "300px" }}>
          <img
            src={file.cloudinaryUrl}
            alt={file.originalName}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }

    // Video preview
    if (file.category === "video") {
      return (
        <div className="bg-black rounded-lg overflow-hidden">
          <video
            controls
            className="w-full max-h-96 object-contain"
            style={{ maxHeight: "300px" }}
          >
            <source src={file.cloudinaryUrl} type={file.mimeType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // Audio preview
    if (file.category === "audio") {
      return (
        <div className="bg-zinc-800 rounded-lg p-6 flex flex-col items-center gap-4">
          <Music className="w-16 h-16 text-yellow-400" />
          <audio controls className="w-full">
            <source src={file.cloudinaryUrl} type={file.mimeType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // PDF preview
    if (file.mimeType === "application/pdf") {
      return (
        <div className="bg-black rounded-lg overflow-hidden">
          <iframe
            src={`${file.cloudinaryUrl}#toolbar=1`}
            className="w-full"
            style={{ height: "300px" }}
            title="PDF Preview"
          />
        </div>
      );
    }

    // Document preview (text-based)
    if (
      file.category === "document" &&
      (file.mimeType.includes("text") ||
        file.mimeType.includes("word") ||
        file.mimeType.includes("sheet"))
    ) {
      return (
        <div className="bg-zinc-800 rounded-lg p-6 flex flex-col items-center gap-4">
          <FileText className="w-16 h-16 text-blue-400" />
          <p className="text-zinc-400 text-sm text-center">
            Document preview not available in browser
          </p>
          <p className="text-zinc-500 text-xs text-center">
            Download to view the full document
          </p>
        </div>
      );
    }

    // Default: no preview available
    return (
      <div className="bg-zinc-800 rounded-lg p-12 flex flex-col items-center gap-4">
        {getFileIcon(file.category)}
        <p className="text-zinc-400 text-sm text-center">
          Preview not available for this file type
        </p>
      </div>
    );
  };

  if (!isOpen || !file) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getFileIcon(file.category)}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">{file.originalName}</h2>
              <p className="text-xs text-zinc-500 uppercase tracking-wide capitalize">{file.category} File</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Preview Section */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Preview</h3>
            {renderPreview()}
          </div>

          {/* Details Section */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Details</h3>
            <div className="space-y-3">
              {/* File Name */}
              <div className="bg-zinc-800 rounded-lg p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">File Name</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-white break-all">{file.originalName}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(file.originalName);
                      setCopied(true);
                    }}
                    className="text-zinc-400 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
                    title="Copy filename"
                  >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* File Size */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Size</p>
                  <p className="text-sm text-white font-medium">{formatFileSize(file.size)}</p>
                </div>

                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Category</p>
                  <p className="text-sm text-white font-medium capitalize">{file.category}</p>
                </div>
              </div>

              {/* MIME Type */}
              <div className="bg-zinc-800 rounded-lg p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">MIME Type</p>
                <p className="text-xs text-zinc-300 font-mono">{file.mimeType}</p>
              </div>

              {/* Upload Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Uploaded</p>
                  <p className="text-xs text-zinc-300">{formatDate(file.createdAt)}</p>
                </div>

                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Last Modified</p>
                  <p className="text-xs text-zinc-300">{formatDate(file.updatedAt)}</p>
                </div>
              </div>

              {/* Encryption Status */}
              <div className="bg-green-950/30 border border-green-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <p className="text-xs text-green-200 uppercase tracking-wide font-medium">Security</p>
                    <p className="text-xs text-green-300 mt-0.5">
                      {file.isEncrypted
                        ? `Encrypted with ${file.algorithm}`
                        : "File is stored unencrypted"}
                    </p>
                  </div>
                </div>
              </div>

              {/* File Hash */}
              {file.fileHash && (
                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">File Hash</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-zinc-300 font-mono break-all">{file.fileHash}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(file.fileHash);
                        setCopied(true);
                      }}
                      className="text-zinc-400 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
                      title="Copy hash"
                    >
                      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Actions</h3>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onDownload(file);
                  onClose();
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download
              </button>
              <button
                onClick={() => {
                  onDelete(file._id);
                  onClose();
                }}
                className="flex-1 bg-red-600/20 hover:bg-red-600/30 transition-colors text-red-400 hover:text-red-300 text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDetailsModal;
