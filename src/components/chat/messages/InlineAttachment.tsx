"use client";

import { FileText, Music, Video, WifiOff } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { viewResource } from "@/lib/api/resource";
import { getApiErrorMessage } from "@/lib/api/client";
import { useTranslation } from "react-i18next";

interface InlineAttachmentProps {
  resourceId?: string;
}

export function InlineAttachment({
  resourceId,
}: Readonly<InlineAttachmentProps>) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation("chat");
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Fetch blob URL if resourceId is provided
  useEffect(() => {
    if (!resourceId) return;

    let isMounted = true;
    let objectUrl: string | null = null;

    const fetchResource = async () => {
      try {
        const blob = await viewResource(resourceId);
        if (isMounted) {
          objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
          setMimeType(blob.type);
          setPreviewError(null);
        }
      } catch (error) {
        console.error("Failed to fetch resource:", error);
        if (isMounted) {
          setPreviewError(
            getApiErrorMessage(
              error,
              t("attachment_preview_unavailable"),
              t("attachment_preview_unavailable_offline"),
            ),
          );
        }
      }
    };

    fetchResource();

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [resourceId]);

  // Determine file type from MIME type
  const fileType = useMemo(() => {
    if (!mimeType) return "file";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    return "file";
  }, [mimeType]);

  const icon = useMemo(() => {
    if (previewError) {
      return <WifiOff className="w-6 h-6 text-amber-600 dark:text-amber-300" />;
    }

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
  }, [fileType, blobUrl, previewError]);

  const handleClick = () => {
    if (!resourceId) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("view", resourceId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={previewError || undefined}
      className={`w-20 h-20 flex items-center justify-center border rounded overflow-hidden ${
        previewError
          ? "border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-800/70 dark:bg-amber-900/20"
          : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      {icon}
    </button>
  );
}
