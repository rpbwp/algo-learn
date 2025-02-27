import { useState } from "react"

import {
  FreeTextFeedback,
  FreeTextQuestion,
} from "../../../shared/src/api/QuestionGenerator"
import useGlobalDOMEvents from "../hooks/useGlobalDOMEvents"
import { useSound } from "../hooks/useSound"
import { useTranslation } from "../hooks/useTranslation"
import { InteractWithQuestion, MODE } from "./InteractWithQuestion"
import { Markdown } from "./Markdown"
import { Result } from "./QuestionComponent"

/**
 * ExerciseTextInput is an exercise that requires the user to type in text.
 *
 * @param props
 * @param props.question The question.
 * @param props.regenerate Function to regenerate the question.
 * @param props.onResult Function to call when the user submits an answer.
 * @param props.permalink Permalink to the question.
 */
export function ExerciseTextInput({
  question,
  regenerate,
  onResult,
  permalink,
}: {
  question: FreeTextQuestion
  regenerate?: () => void
  onResult?: (result: Result) => void
  permalink?: string
}) {
  const { playSound } = useSound()
  const { t } = useTranslation()

  const [state, setState] = useState({
    mode: "invalid" as MODE,

    /** The indices of the selected answers */
    text: "",

    /**
     * The feedback object returned by question.feedback(). Will be set when the
     * Promise returned by question.feedback() resolves.
     */
    feedbackObject: undefined as FreeTextFeedback | undefined,

    /**
     * Message to show when the text is invalid. This is determined by the
     * checkFormat method.
     */
    formatFeedback: undefined as string | undefined,
  })

  const { mode, text, feedbackObject, formatFeedback } = state

  function setText(text: string) {
    setState((state) => ({ ...state, text }))
    if (question.checkFormat) {
      void Promise.resolve(question.checkFormat({ text })).then(
        ({ valid, message }) => {
          setState({
            ...state,
            text,
            mode: valid ? "draft" : "invalid",
            formatFeedback: message,
          })
        },
      )
    } else {
      const valid = text.trim().length > 0
      setState({ ...state, text, mode: valid ? "draft" : "invalid" })
    }
  }

  function handleClick() {
    if (mode === "draft") {
      if (question.feedback !== undefined) {
        setState({ ...state, mode: "submitted" })
        void Promise.resolve(question.feedback({ text })).then(
          (feedbackObject) => {
            let mode: MODE = "draft"
            if (feedbackObject.correct === true) {
              playSound("pass")
              mode = "correct"
            } else if (feedbackObject.correct === false) {
              playSound("fail")
              mode = "incorrect"
            }
            setState({ ...state, mode, feedbackObject })
          },
        )
      }
    } else if (mode === "correct" || mode === "incorrect") {
      onResult && onResult(mode)
    }
  }

  useGlobalDOMEvents({
    keydown(e: Event) {
      const key = (e as KeyboardEvent).key
      if (key === "Enter") {
        e.preventDefault()
        handleClick()
      }
    },
  })

  const msgColor =
    mode === "draft"
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400"
  const message =
    mode === "correct" ? (
      <b className="text-2xl">{t("feedback.correct")}</b>
    ) : mode === "incorrect" ? (
      feedbackObject?.correctAnswer ? (
        <>
          <b className="text-xl">{t("feedback.possible-correct-solution")}:</b>
          <br />
          <Markdown md={feedbackObject.correctAnswer} />
        </>
      ) : (
        <b className="text-2xl">{t("feedback.incorrect")}</b>
      )
    ) : null

  return (
    <InteractWithQuestion
      permalink={permalink}
      name={question.name}
      regenerate={regenerate}
      footerMode={mode}
      footerMessage={message}
      handleFooterClick={handleClick}
    >
      <Markdown md={question.text} />
      <br />
      <br />
      <div className="flex place-items-center gap-2 pl-3">
        <Markdown md={question.prompt} />
        <input
          autoFocus
          type="text"
          onChange={(e) => {
            setText(e.target.value)
          }}
          value={text}
          className="rounded-md bg-gray-300 p-2 dark:bg-gray-900"
          disabled={mode === "correct" || mode === "incorrect"}
        />
        <div className={`flex h-12 items-center ${msgColor}`}>
          <div>
            <Markdown md={formatFeedback} />
          </div>
        </div>
      </div>
      <div className="py-5 text-slate-600 dark:text-slate-400">
        <Markdown md={question.bottomText} />
      </div>
    </InteractWithQuestion>
  )
}
