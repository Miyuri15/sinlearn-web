interface EvaluationData {
  grade: string;
  coverage: number;
  accuracy: number;
  clarity: number;
  strengths: string[];
  weaknesses: string[];
  missing: string[];
  feedback: string;
}

interface EvaluationCardProps {
  data: EvaluationData;
}

export default function EvaluationCard({ data }: EvaluationCardProps) {
  return (
    <div
      className="
        bg-green-50 border border-green-200 p-4 sm:p-6 rounded-xl shadow-md
        dark:bg-[#001a10] dark:border-green-900 dark:shadow-black/20
        transition-colors break-words
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
          Evaluation Report
        </h3>
        <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
          {data.grade}
        </span>
      </div>

      {/* Scores */}
      <div className="space-y-3 mb-5">
        <Score label="Coverage Score" value={data.coverage} />
        <Score label="Accuracy Score" value={data.accuracy} />
        <Score label="Clarity" value={data.clarity} />
      </div>

      <Section title="Strengths" items={data.strengths} color="green" />
      <Section title="Weaknesses" items={data.weaknesses} color="red" />
      <Section title="Missing Points" items={data.missing} color="orange" />

      {/* Feedback Box */}
      <div
        className="
          mt-4 p-4 rounded-lg border 
          bg-white text-gray-900 
          dark:bg-[#0b1b16] dark:border-[#1f3b32] dark:text-gray-200
          break-words
        "
      >
        {data.feedback}
      </div>
    </div>
  );
}

interface ScoreProps {
  label: string;
  value: number;
}

function Score({ label, value }: ScoreProps) {
  return (
    <div>
      {/* Label + Value */}
      <div className="flex justify-between text-xs sm:text-sm font-medium">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-900 dark:text-gray-200">{value}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
        <div
          style={{ width: `${value}%` }}
          className="
            bg-blue-500 dark:bg-blue-400 
            h-2 rounded-full transition-all
          "
        />
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  items: string[];
  color: "green" | "red" | "orange";
}

function Section({ title, items, color }: SectionProps) {
  const colorMap = {
    green: {
      light: "text-green-700",
      dark: "dark:text-green-400",
    },
    red: {
      light: "text-red-700",
      dark: "dark:text-red-400",
    },
    orange: {
      light: "text-orange-700",
      dark: "dark:text-orange-400",
    },
  };

  return (
    <div className="mb-4">
      <h4
        className={`text-sm sm:text-base font-bold ${colorMap[color].light} ${colorMap[color].dark} mb-2`}
      >
        {title}
      </h4>

      <ul className="space-y-1 ml-3 sm:ml-4">
        {items.map((item) => (
          <li
            key={item}
            className="
              list-disc 
              text-sm sm:text-base
              text-gray-800 dark:text-gray-300
              break-words
            "
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
