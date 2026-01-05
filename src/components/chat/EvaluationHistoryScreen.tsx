import React from "react";
import { 
  Calendar, 
  Clock, 
  FileText, 
  ChevronRight, 
  ArrowLeft,
  BarChart2
} from "lucide-react";
import Button from "@/components/ui/Button";
import { formatDistanceToNow } from "date-fns";

export interface EvaluationSession {
  id: string;
  timestamp: number;
  files: File[];
  results: any[]; // Using any for now to match the mock structure
  averageScore: number;
}

interface EvaluationHistoryScreenProps {
  history: EvaluationSession[];
  onSelectSession: (session: EvaluationSession) => void;
  onBack: () => void;
}

export default function EvaluationHistoryScreen({
  history,
  onSelectSession,
  onBack
}: EvaluationHistoryScreenProps) {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white dark:bg-[#111111] p-6 rounded-xl border border-gray-200 dark:border-[#2a2a2a]">
        <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Evaluation History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            View past evaluation sessions and results
          </p>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-[#2a2a2a]">
            <div className="w-16 h-16 bg-gray-100 dark:bg-[#222] rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No History Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Complete an evaluation to see it here.
            </p>
          </div>
        ) : (
          history.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session)}
              className="group bg-white dark:bg-[#111111] p-5 rounded-xl border border-gray-200 dark:border-[#2a2a2a] hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg flex items-center gap-2">
                      Evaluation Session
                      <span className="text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#222] px-2 py-0.5 rounded-full">
                        {formatDistanceToNow(session.timestamp, { addSuffix: true })}
                      </span>
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        {session.files.length} Answer Sheet{session.files.length !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BarChart2 className="w-4 h-4" />
                        Avg. Score: <span className="font-medium text-gray-700 dark:text-gray-300">{session.averageScore}%</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
