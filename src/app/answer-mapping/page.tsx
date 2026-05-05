"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { ApiError, apiFetch } from "@/lib/api/client";

interface MappingResponse {
  answer_document_id: string;
  mapped_answers: Record<string, string>;
  extracted_text?: string;
}

export default function AnswerMappingPage() {
  const router = useRouter();
  const [answerId, setAnswerId] = useState("");
  const [fileName, setFileName] = useState("");
  const [mapping, setMapping] = useState<MappingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [remapping, setRemapping] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAnswerId(params.get("answerId") || "");
    setFileName(params.get("fileName") || "");
  }, []);

  const mappedEntries = useMemo(
    () => Object.entries(mapping?.mapped_answers || {}),
    [mapping],
  );

  const fetchMapping = async (id: string) => {
    if (!id) return;

    setLoading(true);
    setError("");
    setMapping(null);

    try {
      const encodedId = encodeURIComponent(id);
      const endpoints = [
        `${API_BASE_URL}/api/v1/evaluation/answers/${encodedId}/mapping`,
        `${API_BASE_URL}/api/v1/answers/${encodedId}/mapping`,
        `${API_BASE_URL}/answers/${encodedId}/mapping`,
      ];

      let lastError: unknown = null;

      for (const endpoint of endpoints) {
        try {
          const data = await apiFetch<MappingResponse>(endpoint);
          setMapping(data);
          return;
        } catch (err) {
          lastError = err;
          if (!(err instanceof ApiError) || (err.status !== 404 && err.status !== 405)) {
            throw err;
          }
        }
      }

      throw lastError instanceof Error
        ? lastError
        : new Error("Mapped collection was not found for this document.");
    } catch (err) {
      const message =
        err instanceof ApiError && (err.status === 404 || err.status === 405)
          ? "Mapped collection was not found for this document."
          : err instanceof Error
            ? err.message
            : "Failed to fetch mapping";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const remapAnswers = async (id: string) => {
    if (!id) return;

    setRemapping(true);
    setError("");

    try {
      const encodedId = encodeURIComponent(id);
      const endpoints = [
        `${API_BASE_URL}/api/v1/evaluation/answers/${encodedId}/remap`,
        `${API_BASE_URL}/api/v1/evaluation/answers/${encodedId}/parse?force_remap=true`,
      ];

      let lastError: unknown = null;

      for (const endpoint of endpoints) {
        try {
          const data = await apiFetch<MappingResponse>(endpoint, { method: "POST" });
          setMapping(data);
          return;
        } catch (err) {
          lastError = err;
          if (!(err instanceof ApiError) || (err.status !== 404 && err.status !== 405)) {
            throw err;
          }
        }
      }

      throw lastError instanceof Error
        ? lastError
        : new Error("Failed to remap answers for this document.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remap answers";
      setError(message);
    } finally {
      setRemapping(false);
    }
  };

  useEffect(() => {
    fetchMapping(answerId);
  }, [answerId]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchMapping(answerId)}
            disabled={loading || remapping || !answerId}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#333] dark:text-gray-200 dark:hover:bg-[#1a1a1a]"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            onClick={() => remapAnswers(answerId)}
            disabled={loading || remapping || !answerId}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={16} className={remapping ? "animate-spin" : ""} />
            {remapping ? "Remapping..." : "Remap answers"}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Answer Mapping Review
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {fileName || "Selected answer sheet"}
        </p>
      </div>

      {!answerId && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          Open this review from an uploaded answer sheet after processing documents.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {mapping && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#2a2a2a] dark:bg-[#111111]">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Mapped Answers
            </h2>
            <p className="mt-1 break-all text-xs text-gray-500 dark:text-gray-400">
              Answer Document ID: {mapping.answer_document_id}
            </p>
          </div>

          <div className="mb-5">
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              Extracted Text
            </h3>
            <pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-100 p-3 text-xs text-gray-700 dark:bg-[#1a1a1a] dark:text-gray-300">
              {mapping.extracted_text || "N/A"}
            </pre>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
              Mappings
            </h3>
            {mappedEntries.length > 0 ? (
              <div className="space-y-3">
                {mappedEntries.map(([qid, answer]) => (
                  <div
                    key={qid}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
                  >
                    <div className="mb-1 font-mono text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {qid}
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                      {answer}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No mapped answers were returned for this document.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
