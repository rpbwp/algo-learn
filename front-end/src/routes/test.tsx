import { useState } from "react"
import SyntaxHighlighter from "react-syntax-highlighter"
import {
  solarizedDark,
  solarizedLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs"

import {
  Question,
  questionToJSON,
} from "../../../shared/src/api/QuestionGenerator"
import { ExampleQuestion } from "../../../shared/src/question-generators/example/example"
import Random from "../../../shared/src/utils/random"
import { questionToTex } from "../../../shared/src/utils/toLatex"
import { HorizontallyCenteredDiv } from "../components/CenteredDivs"
import { QuestionComponent } from "../components/QuestionComponent"
import { useTheme } from "../hooks/useTheme"
import { useTranslation } from "../hooks/useTranslation"

/** Component for testing the question generator */
export function TestSimpleMC() {
  const { lang } = useTranslation()
  const { theme } = useTheme()
  const [seed] = useState(new Random(Math.random()).base36string(7))
  const [format, setFormat] = useState("react" as "react" | "latex" | "json")
  const [{ question }, setQuestion] = useState(
    {} as { question: Question | undefined },
  )

  if (!question) {
    void Promise.resolve(
      ExampleQuestion.generate("example/example", lang, {}, seed),
    ).then(setQuestion)
    return <></>
  }
  return (
    <>
      <HorizontallyCenteredDiv className="select-none">
        <form action="" className="text-center">
          <fieldset>
            <legend>Select a display format:</legend>

            <input
              type="radio"
              checked={format === "react"}
              onChange={(e) => e.target.checked && setFormat("react")}
              id="react-checkbox"
              className="m-2"
            />
            <label className="" htmlFor="react-checkbox">
              React
            </label>

            <input
              type="radio"
              checked={format === "latex"}
              onChange={(e) => e.target.checked && setFormat("latex")}
              id="latex-checkbox"
              className="m-2"
            />
            <label htmlFor="latex-checkbox">LaTeX</label>

            <input
              type="radio"
              checked={format === "json"}
              onChange={(e) => e.target.checked && setFormat("json")}
              id="json-checkbox"
              className="m-2"
            />
            <label htmlFor="json-checkbox">JSON</label>
          </fieldset>
        </form>
      </HorizontallyCenteredDiv>
      {format === "react" ? (
        <QuestionComponent
          question={question}
          key={seed}
          onResult={() => undefined}
        />
      ) : (
        <HorizontallyCenteredDiv className="w-full flex-grow overflow-y-scroll">
          <SyntaxHighlighter
            language={format}
            wrapLongLines
            style={theme === "dark" ? solarizedDark : solarizedLight}
          >
            {format === "latex"
              ? questionToTex(question)
              : questionToJSON(question)}
          </SyntaxHighlighter>
        </HorizontallyCenteredDiv>
      )}
    </>
  )
}
