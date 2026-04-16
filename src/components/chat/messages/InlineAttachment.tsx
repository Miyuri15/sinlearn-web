"use client";

import { FileText, Music, Video } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { viewResource } from "@/lib/api/resource";

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
        }
      } catch (error) {
        console.error("Failed to fetch resource:", error);
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
      className="w-20 h-20 flex items-center justify-center border rounded overflow-hidden bg-gray-50 hover:bg-gray-100"
    >
      {icon}
    </button>
  );
}
