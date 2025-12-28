import { InlineAttachment } from "./InlineAttachment";

interface MessageAttachmentsProps {
  files?: any[]; // Replace 'any' with your specific File type if available
}

export function MessageAttachments({ files }: MessageAttachmentsProps) {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {files.map((file, index) => (
        <InlineAttachment key={file.id || index} file={file} />
      ))}
    </div>
  );
}
