"use client";

import { FileText, Music, Video } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { viewResource } from "@/lib/api/resource";
import FilePreviewModal from "../uploads/FilePreviewModal";

interface InlineAttachmentProps {
  resourceId?: string;
}

export function InlineAttachment({ resourceId }: InlineAttachmentProps) {
  const [showModal, setShowModal] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mimeType, setMimeType] = useState<string | null>(null);

  const id = resourceId;

  // Fetch blob URL if resourceId is provided
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    const fetchResource = async () => {
      try {
        setLoading(true);
        const blob = await viewResource(id); // fetch blob
        if (isMounted) {
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          setMimeType(blob.type); // save MIME type for rendering
        }
      } catch (error) {
        console.error("Failed to fetch resource:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResource();

    return () => {
      isMounted = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl); // cleanup
    };
  }, [id]);

  // Determine file type from MIME type
  const fileType = useMemo(() => {
    if (!mimeType) return "file";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    return "file";
  }, [mimeType]);

  const icon = useMemo(() => {
    switch (fileType) {
      case "image":
        return (
          <img
            src={blobUrl || ""}
            alt="attachment"
            className="object-cover w-full h-full"
          />
        );
      case "video":
        return <Video className="w-6 h-6 text-gray-500" />;
      case "audio":
        return <Music className="w-6 h-6 text-gray-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  }, [fileType, blobUrl]);

  const handleClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  if (loading) {
    return (
      <div className="w-20 h-20 flex items-center justify-center border rounded bg-gray-50 text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div
        onClick={handleClick}
        className="w-20 h-20 flex items-center justify-center border rounded cursor-pointer overflow-hidden bg-gray-50 hover:bg-gray-100"
      >
        {icon}
      </div>

      {/* Optionally include modal preview if needed */}
      {showModal && blobUrl && (
        <FilePreviewModal
          resourceId={id}
          url={blobUrl}
          type={
            fileType === "file" && mimeType?.includes("pdf") ? "pdf" : fileType
          }
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
