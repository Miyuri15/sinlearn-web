"use client";

import { useEffect, useRef } from "react";

type RecordBarProps = Readonly<{
  onCancelRecording?: () => void;
  onStopRecording?: (audio: Blob) => void;
}>;

export default function RecordBar({
  onCancelRecording,
  onStopRecording,
}: RecordBarProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // 🎤 Start recording when component mounts
  useEffect(() => {
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start();
      } catch (err) {
        console.error("Microphone access denied:", err);
        onCancelRecording?.();
      }
    };

    startRecording();

    // 🧹 Cleanup on unmount
    return () => {
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ⏹ Stop recording → return audio blob
  const handleStop = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/wav",
      });

      streamRef.current?.getTracks().forEach((t) => t.stop());
      onStopRecording?.(audioBlob);
    };

    recorder.stop();
  };

  // ❌ Cancel recording
  const handleCancel = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioChunksRef.current = [];
    onCancelRecording?.();
  };

  return (
    <div className="flex justify-center px-2 sm:px-4 pb-2">
      <div className="w-full max-w-xl bg-red-50 border border-red-100 text-red-600 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg flex items-center justify-between gap-3 sm:gap-4 animate-slide-up">
        {/* Left Side */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-medium text-sm sm:text-base">Recording</span>
        </div>

        {/* Waveform */}
        <div className="hidden sm:flex items-end gap-1 h-6">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-red-400 rounded-full animate-wave"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-5 text-xs sm:text-sm">
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 whitespace-nowrap"
          >
            ✕ Cancel
          </button>

          <button
            onClick={handleStop}
            className="text-red-600 font-medium hover:text-red-700 whitespace-nowrap"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
