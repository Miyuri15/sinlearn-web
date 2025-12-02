export default function EvaluationCard({ data }) {
  return (
    <div className="bg-green-50 border border-green-200 p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Evaluation Report</h3>
        <span className="text-xl font-bold">{data.grade}</span>
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

      <div className="mt-4 p-4 bg-white border rounded-lg">{data.feedback}</div>
    </div>
  );
}

function Score({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-sm font-medium">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          style={{ width: `${value}%` }}
          className="bg-blue-500 h-2 rounded-full"
        />
      </div>
    </div>
  );
}

function Section({ title, items, color }) {
  const colorMap = {
    green: "text-green-700",
    red: "text-red-700",
    orange: "text-orange-700",
  };

  return (
    <div className="mb-4">
      <h4 className={`font-bold ${colorMap[color]} mb-2`}>{title}</h4>
      <ul className="space-y-1 ml-4">
        {items.map((item, i) => (
          <li key={i} className="list-disc">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
