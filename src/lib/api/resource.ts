import { API_BASE_URL } from "../config";
import { getAccessToken } from "../localStore";
import { ApiError, apiFetch } from "./client";

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

export const detachResourceFromSession = async (params: {
  sessionId: string;
  resourceId: string;
}): Promise<void> => {
  const { sessionId, resourceId } = params;
  await apiFetch<void>(
    `${API_BASE_URL}/api/v1/chat/sessions/${encodeURIComponent(
      sessionId
    )}/resources/${encodeURIComponent(resourceId)}`,
    { method: "DELETE" }
  );
};

// Detach all answer scripts from a chat session (server keeps resources; session unlinks them)
export const detachAnswerScriptsFromSession = async (params: {
  sessionId: string;
}): Promise<void> => {
  const { sessionId } = params;
  await apiFetch<void>(
    `${API_BASE_URL}/api/v1/chat/sessions/${encodeURIComponent(
      sessionId
    )}/resources/answer_script`,
    { method: "DELETE" }
  );
};

// Detach a single answer sheet from a chat session (server keeps the resource)
export const detachAnswerSheetFromSession = async (params: {
  sessionId: string;
  resourceId: string;
}): Promise<void> => {
  const { sessionId, resourceId } = params;
  const primaryUrl = `${API_BASE_URL}/api/v1/chat/sessions/${encodeURIComponent(
    sessionId
  )}/answer-sheets/${encodeURIComponent(resourceId)}`;

  try {
    await apiFetch<void>(primaryUrl, { method: "DELETE" });
    return;
  } catch (e) {
    // If the primary route isn't available, try common alternates.
    if (!(e instanceof ApiError) || (e.status !== 404 && e.status !== 405)) {
      throw e;
    }
  }

  const alternates = [
    // Some backends use answer-scripts naming
    `${API_BASE_URL}/api/v1/chat/sessions/${encodeURIComponent(
      sessionId
    )}/answer-scripts/${encodeURIComponent(resourceId)}`,
    // Some backends nest it under resources/answer_script
    `${API_BASE_URL}/api/v1/chat/sessions/${encodeURIComponent(
      sessionId
    )}/resources/answer_script/${encodeURIComponent(resourceId)}`,
  ];

  let lastError: unknown = null;
  for (const url of alternates) {
    try {
      await apiFetch<void>(url, { method: "DELETE" });
      return;
    } catch (err) {
      lastError = err;
      if (!(err instanceof ApiError) || (err.status !== 404 && err.status !== 405)) {
        throw err;
      }
    }
  }

  // Fall back to the original error context if all alternates are missing.
  throw (lastError ?? new ApiError("Answer sheet detach endpoint not found", { status: 404, url: primaryUrl }));
};

export const deleteResource = async (resourceId: string): Promise<void> => {
  await apiFetch<void>(
    `${API_BASE_URL}/api/v1/resources/${encodeURIComponent(resourceId)}`,
    { method: "DELETE" }
  );
};

// Best-effort removal: prefer detach-from-session when available, otherwise delete resource.
export const removeResourceForSession = async (params: {
  sessionId?: string | null;
  resourceId: string;
}): Promise<void> => {
  const { sessionId, resourceId } = params;
  if (sessionId) {
    try {
      await detachResourceFromSession({ sessionId, resourceId });
      return;
    } catch (e) {
      // If detach endpoint isn't implemented, fall back to deleting the resource.
      if (e instanceof ApiError && (e.status === 404 || e.status === 405)) {
        // continue
      } else {
        throw e;
      }
    }
  }

  await deleteResource(resourceId);
};
