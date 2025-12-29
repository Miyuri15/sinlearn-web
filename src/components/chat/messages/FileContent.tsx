import FilePreviewCard from "@/components/chat/FilePreviewCard";
import { MESSAGE_STYLES } from "./styles";

interface FileContentProps {
  file: File;
}
/**
 * FileContent: Renders file attachments
 */
export function FileContent({ file }: Readonly<FileContentProps>) {
  if (file instanceof File) {
    return <FilePreviewCard file={file} />;
  }
  const fm = file as any;
  return (
    <div className={MESSAGE_STYLES.fileContent}>
      {fm.name || fm.url || "Attachment"}
    </div>
  );
}
