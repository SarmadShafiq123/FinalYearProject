import useFiles from "../../hooks/useFiles";

const DownloadButton = ({ file }) => {
  const { downloadFile, downloadStage } = useFiles();

  const handleDownload = async () => {
    if (downloadStage !== "idle") return;
    try {
      await downloadFile(file);
    } catch (err) {
      alert(err.response?.data?.message || "Download failed. Please try again.");
    }
  };

  const isDownloading = downloadStage !== "idle" && downloadStage !== "complete";

  const getButtonText = () => {
    switch (downloadStage) {
      case "fetching":
        return "Fetching secure file...";
      case "decrypting":
        return "Decrypting...";
      case "downloading":
        return "Downloading...";
      case "complete":
        return "Download";
      default:
        return "Download";
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="flex-1 bg-zinc-800 hover:bg-zinc-700 transition-colors text-white text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={`Download ${file.originalName}`}
    >
      {getButtonText()}
    </button>
  );
};

export default DownloadButton;
