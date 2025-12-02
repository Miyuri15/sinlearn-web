"use client";

import ChatLanguageToggle from "@/components/language/ChatLanguageToggle";
import MarkingRubic from "@/app/chat/components/MarkingRubic";
import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import InputBar from "./components/InputBar";
import RecordBar from "./components/RecordBar";
import EvaluationCard from "./components/EvaluationCard";

export default function Chat() {
  const { t } = useTranslation("chat");
  // --- STATES ---
  const [loading, setLoading] = useState(false);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"learning" | "evaluation">("learning");
  const [messages, setMessages] = useState<any[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  // --- INPUT HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    if (value.trim() === "") {
      e.target.style.height = "auto";
      return;
    }
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setMessage(transcript);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setTranscript("");
  };

  // --- HARDCODED LEARNING MODE RESPONSE ---
  const mockLearningReply =
    "Good job! When x = 5, the expression 3x² - 2x + 4 becomes:\n3(25) - 10 + 4 = 69.";

  // --- HARDCODED EVALUATION REPORT ---
  const mockEvaluation = {
    grade: "B+",
    coverage: 76,
    accuracy: 85,
    clarity: 72,
    strengths: ["Correct substitution", "Steps shown clearly"],
    weaknesses: ["Could improve explanation clarity"],
    missing: ["Final conclusion missing"],
    feedback:
      "Your answer is mostly correct. However, adding a final conclusion would improve clarity.",
  };

  // --- SEND BUTTON HANDLER ---
  const handleSend = () => {
    if (!message.trim()) return;

    const userMsg = { role: "user", content: message };

    if (mode === "learning") {
      // Add user msg + hardcoded AI
      setMessages((prev) => [
        ...prev,
        userMsg,
        { role: "assistant", content: mockLearningReply },
      ]);
    } else {
      // Add user msg + evaluation card
      setMessages((prev) => [
        ...prev,
        userMsg,
        { role: "evaluation", content: mockEvaluation },
      ]);
    }

    setMessage("");
  };

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <main className="flex min-h-screen bg-gray-100 text-gray-900 relative overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-16 bg-white border-r flex items-start justify-center p-4">
        <Menu className="w-6 h-6 text-gray-700 cursor-pointer" />
      </div>

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 min-h-screen h-screen justify-between">
        {/* TOP BAR */}
        <div className="flex items-center justify-between bg-white p-4 border-b">
          {/* MODE TOGGLE */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode("learning")}
              className={`px-4 py-2 rounded-lg font-medium border 
              ${
                mode === "learning"
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {t("learning_mode")}
            </button>

            <button
              onClick={() => setMode("evaluation")}
              className={`px-4 py-2 rounded-lg font-medium border 
              ${
                mode === "evaluation"
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {t("evaluation_mode")}
            </button>
          </div>

          {/* RIGHT OPTIONS */}
          <div className="flex items-center gap-4">
            <ChatLanguageToggle />

            <button
              onClick={() => setIsRubricOpen(true)}
              className="px-4 py-2 rounded-lg bg-white border font-medium text-gray-700"
            >
              Rubric
            </button>

            <button className="px-4 py-2 rounded-lg bg-white border font-medium text-gray-700">
              Syllabus
            </button>

            <button className="w-9 h-9 flex items-center justify-center border rounded-lg bg-white text-gray-700">
              +
            </button>
          </div>
        </div>

        {/* MESSAGE AREA */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 flex flex-col">
          {/* CENTER CONTENT (only show when no messages) */}
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-center px-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-700">
                  {t("start_conversation")}
                </h2>
                <p className="text-gray-500 mt-2">
                  {t("start_conversation_sub")}
                </p>
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i}>
              {m.role === "user" && (
                <div className="bg-blue-100 p-3 rounded-lg max-w-xl ml-auto text-blue-900 break-all">
                  {m.content}
                </div>
              )}

              {m.role === "assistant" && (
                <div className="bg-white p-4 rounded-lg shadow max-w-xl">
                  {m.content}
                </div>
              )}

              {m.role === "evaluation" && <EvaluationCard data={m.content} />}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-4 border-t bg-white">
          {isRecording && (
            <RecordBar
              onCancelRecording={handleCancelRecording}
              onStopRecording={handleStopRecording}
            />
          )}

          <InputBar
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            transcript={transcript}
            message={message}
            handleInputChange={handleInputChange}
            onSend={handleSend}
          />
        </div>
      </div>

      {/* RIGHT SLIDE SIDEBAR */}
      <div
        className={`fixed right-0 top-0 h-full transition-transform duration-300 
        ${isRubricOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <MarkingRubic
          loading={loading}
          onClose={() => setIsRubricOpen(false)}
          onSelectRubric={(id) => console.log("Selected:", id)}
          onUpload={() => console.log("Upload pressed")}
        />
      </div>
    </main>
  );
}
