import { FunctionComponent, useEffect, useState } from "react"

import { Question } from "../../../shared/src/api/QuestionGenerator"
import { ExerciseMultipleChoice } from "./ExerciseMultipleChoice"
import { ExerciseTextInput } from "./ExerciseTextInput"

/** Props for the React Component */
export interface QuestionComponentProps {
  /** The question object, or a promise for the question object. */
  questionPromise: Question | Promise<Question>

  /** Callback for when a result is produced */
  onResult?: (result: Result) => void

  /** Optional callback to regenerate the question */
  regenerate?: () => void

  // viewOnly?: boolean // Determines whether the component should displayed interactively or non-interactively
  // source?: boolean // If true, display the LaTeX source code of the question
}

/** Result type for exercise results */
export type Result = "correct" | "incorrect" | "abort" | "timeout"

/** Function to render the question as a React component */
export const QuestionComponent: FunctionComponent<QuestionComponentProps> = ({
  questionPromise,
  onResult,
  regenerate,
}) => {
  const [question, setQuestion] = useState<Question | undefined>(
    questionPromise instanceof Promise ? undefined : questionPromise,
  )
  useEffect(() => {
    void Promise.resolve(questionPromise).then((q) => setQuestion(q))
  }, [questionPromise])

  if (question === undefined) {
    return <>Loading...</>
  } else if (question.type === "MultipleChoiceQuestion") {
    return (
      <ExerciseMultipleChoice
        question={question}
        regenerate={regenerate}
        onResult={onResult}
        permalink={question.path}
      />
    )
  } else if (question.type === "FreeTextQuestion") {
    return (
      <ExerciseTextInput
        question={question}
        regenerate={regenerate}
        onResult={onResult}
        permalink={question.path}
      />
    )
  }
  return <>Unsupported question type.</>
}
