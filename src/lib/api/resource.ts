import { API_BASE_URL } from "../config";
import { getAccessToken } from "../localStore";
import { apiFetch } from "./client";

// Fetch resource as blob for inline display (PDF, images, audio, video)
export const viewResource = async (resourceId: string): Promise<Blob> => {
  const token = getAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/api/v1/resources/${resourceId}/view`,
    {
      method: "GET",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    }
  );

  if (!response.ok) throw new Error("Failed to fetch resource");

  return await response.blob(); // <-- This is a real Blob now
};

// Fetch resource as blob for download
export const downloadResource = async (
  resourceId: string,
  filename?: string
): Promise<void> => {
  const token = getAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/api/v1/resources/${resourceId}/download`,
    {
      method: "GET",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    }
  );

  if (!response.ok) throw new Error("Failed to download resource");

  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);

  // Determine filename from content-disposition or fallback
  let fileNameFromHeader = filename;
  const disposition = response.headers.get("content-disposition");
  if (disposition) {
    const match = disposition.match(/filename="?(.+)"?/);
    if (match && match[1]) fileNameFromHeader = match[1];
  }
  fileNameFromHeader ||= "download";

  // Trigger download
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = fileNameFromHeader;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(downloadUrl);
};

export const processMessageAttachments = (messageId: string) => {
  return apiFetch<void>(
    `${API_BASE_URL}/api/v1/messages/${messageId}/attachments/process`,
    {
      method: "POST",
    }
  );
};

export type ResourceBatchProcessResponse = {
  resource_id: string;
  status: string;
  chunks_created?: number;
  message?: string;
}[];

export const processResourcesBatch = (resourceIds: string[]) => {
  return apiFetch<ResourceBatchProcessResponse>(
    `${API_BASE_URL}/api/v1/resources/process/batch`,
    {
      method: "POST",
      body: JSON.stringify({
        resource_ids: resourceIds,
      }),
    }
  );
};
