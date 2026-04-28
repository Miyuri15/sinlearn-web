"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilePreviewModal from "@/components/chat/uploads/FilePreviewModal";
import { viewResource } from "@/lib/api/resource";
import { getApiErrorMessage } from "@/lib/api/client";
import { useTranslation } from "react-i18next";

function getPreviewType(
  mimeType: string | null,
): "image" | "video" | "audio" | "pdf" | "file" {
  if (!mimeType) return "file";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("pdf")) return "pdf";
  return "file";
}

export default function ChatResourcePreviewModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resourceId = searchParams.get("view");
  const { t } = useTranslation("chat");

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!resourceId) {
      setBlobUrl(null);
      setMimeType(null);
      setPreviewError(null);
      return;
    }

    let isActive = true;
    let currentObjectUrl: string | null = null;

    const loadResource = async () => {
      try {
        const blob = await viewResource(resourceId);
        if (!isActive) return;

        currentObjectUrl = URL.createObjectURL(blob);
        setBlobUrl(currentObjectUrl);
        setMimeType(blob.type);
        setPreviewError(null);
      } catch (error) {
        console.error("Failed to load attachment preview:", error);
        if (!isActive) return;
        setBlobUrl(null);
        setMimeType(null);
        setPreviewError(
          getApiErrorMessage(
            error,
            t("attachment_preview_unavailable"),
            t("attachment_preview_unavailable_offline"),
          ),
        );
      }
    };

    loadResource();

    return () => {
      isActive = false;
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [resourceId]); // Only re-run when resourceId changes

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const previewType = useMemo(() => getPreviewType(mimeType), [mimeType]);

  if (!resourceId) return null;

  return (
    <FilePreviewModal
      resourceId={resourceId}
      url={blobUrl || ""}
      type={previewType}
      onClose={handleClose}
      previewError={previewError}
    />
  );
}
