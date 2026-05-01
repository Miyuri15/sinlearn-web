"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilePreviewModal from "@/components/chat/uploads/FilePreviewModal";
import { getResourceExtractedText, viewResource } from "@/lib/api/resource";
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
  const [extractedText, setExtractedText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedTextError, setExtractedTextError] = useState<string | null>(
    null,
  );
  const [extractedTextMeta, setExtractedTextMeta] = useState({
    page: 1,
    pageSize: 1,
    totalPages: 0,
    returnedPages: 0,
    hasNext: false,
    hasPrevious: false,
  });

  useEffect(() => {
    if (!resourceId) {
      setBlobUrl(null);
      setMimeType(null);
      setPreviewError(null);
      setExtractedText("");
      setIsExtracting(false);
      setExtractedTextError(null);
      setExtractedTextMeta({
        page: 1,
        pageSize: 1,
        totalPages: 0,
        returnedPages: 0,
        hasNext: false,
        hasPrevious: false,
      });
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

    const loadExtractedText = async () => {
      setIsExtracting(true);
      setExtractedText("");
      setExtractedTextError(null);

      try {
        const response = await getResourceExtractedText(resourceId, {
          page: 1,
          pageSize: 1,
        });
        if (!isActive) return;
        setExtractedText(response.extracted_text || "");
        setExtractedTextMeta({
          page: response.page || 1,
          pageSize: response.page_size || 1,
          totalPages: response.total_pages || 0,
          returnedPages: response.returned_pages || 0,
          hasNext: response.has_next,
          hasPrevious: response.has_previous,
        });
      } catch (error) {
        console.error("Failed to load extracted text:", error);
        if (!isActive) return;
        setExtractedText("");
        setExtractedTextError(
          getApiErrorMessage(
            error,
            "Failed to load extracted text.",
            t("attachment_preview_unavailable_offline"),
          ),
        );
      } finally {
        if (isActive) {
          setIsExtracting(false);
        }
      }
    };

    loadResource();
    loadExtractedText();

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
      extractedText={extractedText}
      isExtracting={isExtracting}
      extractedTextError={extractedTextError}
      extractedTextPage={extractedTextMeta.page}
      extractedTextPageSize={extractedTextMeta.pageSize}
      extractedTextTotalPages={extractedTextMeta.totalPages}
      extractedTextReturnedPages={extractedTextMeta.returnedPages}
      extractedTextHasNext={extractedTextMeta.hasNext}
      extractedTextHasPrevious={extractedTextMeta.hasPrevious}
    />
  );
}
