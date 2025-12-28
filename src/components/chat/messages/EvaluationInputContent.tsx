import { MESSAGE_STYLES } from "./styles";

interface EvaluationInputContentProps {
  content: {
    totalMarks?: number;
    mainQuestions?: number;
    requiredQuestions?: number;
    subQuestions?: number;
    subQuestionMarks?: number[] | number[][];
  };
}

/**
 * EvaluationInputContent: Renders evaluation input structured data
 */
export function EvaluationInputContent({
  content,
}: Readonly<EvaluationInputContentProps>) {
  const c = content as any;
  return (
    <pre className={MESSAGE_STYLES.evaluationInputPre}>
      {`Total Marks: ${c.totalMarks}
Main Questions: ${c.mainQuestions}
Required Questions: ${c.requiredQuestions}
Sub Questions: ${c.subQuestions}`}
      {c.subQuestionMarks && c.subQuestionMarks.length > 0 && (
        <>
          {`\nSub Question Marks: \n`}
          {c.subQuestionMarks.map(
            (mark: number, idx: number) =>
              `  ${String.fromCodePoint(97 + idx)}) ${mark}`
          )}
        </>
      )}
    </pre>
  );
}
