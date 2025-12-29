import { InlineAttachment } from "./InlineAttachment";

interface MessageAttachmentsProps {
  resourceIds?: string[];
}

export function MessageAttachments({
  resourceIds,
}: Readonly<MessageAttachmentsProps>) {
  if (!resourceIds || resourceIds.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {resourceIds?.map((id) => (
        <InlineAttachment key={id} resourceId={id} />
      ))}
    </div>
  );
}
