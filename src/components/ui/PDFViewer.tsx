import Image from "next/image";
import { useState, useEffect } from "react";
import { viewResource, downloadResource } from "../../lib/api/resource";
import { useToast } from "@/components/ui/Toast";

type PDFViewerProps = {
  fileName: string;
  resourceId: string;
  onClose: () => void;
};

const PDFViewer = ({ fileName, resourceId, onClose }: PDFViewerProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const blob = await viewResource(resourceId);
        const url = URL.createObjectURL(blob);
        setFileUrl(url);
      } catch (error) {
        console.error("Failed to fetch PDF", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFile();

    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [resourceId]);

  const handleDownload = async () => {
    try {
      await downloadResource(resourceId, fileName);
    } catch (error) {
      console.error("Failed to download PDF", error);
      showToast("Download Failed", "Failed to download file.", "error");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">Loading PDF...</div>
      </div>
    );
  }

  if (!fileUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Image
              src="/icons/document.svg"
              alt="Document"
              width={20}
              height={20}
            />
            <h3 className="font-semibold text-gray-800 truncate">{fileName}</h3>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          <iframe
            src={fileUrl}
            className="w-full h-full border-0"
            title={fileName}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            Download
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
