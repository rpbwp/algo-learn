import { Fragment, FunctionComponent, ReactNode } from "react"
import { Link } from "react-router-dom"
import SyntaxHighlighter from "react-syntax-highlighter"
import {
  solarizedDark,
  solarizedLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs"

import {
  parseMarkdown,
  ParseTree,
  ParseTreeNode,
} from "../../../shared/src/utils/parseMarkdown"
import { useTheme } from "../hooks/useTheme"
import TeX from "./TeX"
import { Format } from "./Format"

/**
 * Function to render a given markdown-like string as a React component
 *
 * @param props
 * @param props.md The markdown-like string to render
 * @param props.children The parameters to replace the mustache-style placeholders in the string
 * @returns The React component
 */
export const Markdown: FunctionComponent<{
  md?: string
  children?: ReactNode[]
}> = ({ md, children }) => {
  if (!md) {
    return <></>
  }
  return <MarkdownTree parseTree={parseMarkdown(md)} parameters={children} />
}

/**
 * Function to render a given parseTree as a React component
 *
 * @param props
 * @param props.parseTree The parse tree to render
 * @returns The React component
 */
export const MarkdownTree: FunctionComponent<{
  parseTree: ParseTree
  parameters?: ReactNode[]
}> = ({ parseTree, parameters }) => {
  // TODO: Implement this function
  return (
    <>
      {parseTree.map((node, index) => (
        <Fragment key={index}>
          <MarkdownTreeNode parseTreeNode={node} parameters={parameters} />
        </Fragment>
      ))}
    </>
  )
}

/**
 * Function to render a given parseTreeNode as a React component
 *
 * @param props
 * @param props.parseTreeNode The parse tree node to render
 * @returns The React component
 */
export const MarkdownTreeNode: FunctionComponent<{
  parseTreeNode: ParseTreeNode
  parameters?: ReactNode[]
}> = ({ parseTreeNode, parameters }) => {
  const { theme } = useTheme()
  if (typeof parseTreeNode === "string") {
    return <Format template={parseTreeNode} parameters={parameters} />
  }
  if (parseTreeNode.kind === "$$") {
    return <TeX tex={parseTreeNode.child} block />
  }
  if (parseTreeNode.kind === "$") {
    return <TeX tex={parseTreeNode.child} />
  }
  if (parseTreeNode.kind === "**") {
    return (
      <b>
        <MarkdownTree parseTree={parseTreeNode.child} />
      </b>
    )
  }
  if (parseTreeNode.kind === "*") {
    return (
      <i>
        <MarkdownTree parseTree={parseTreeNode.child} />
      </i>
    )
  }
  if (parseTreeNode.kind === "`") {
    return (
      <span className="font-mono">
        {format(parseTreeNode.child, parameters)}
      </span>
    )
  }
  if (parseTreeNode.kind === "```") {
    return (
      <div className="my-5">
        <SyntaxHighlighter
          language={parseTreeNode.language}
          style={theme === "light" ? solarizedLight : solarizedDark}
        >
          {parseTreeNode.child}
        </SyntaxHighlighter>
      </div>
    )
  }
  if (parseTreeNode.kind === "a") {
    return (
      <Link to={format(parseTreeNode.url, parameters)}>
        <MarkdownTree parseTree={parseTreeNode.child} parameters={parameters} />
      </Link>
    )
  }
  if (parseTreeNode.kind === ">") {
    return (
      <blockquote className="my-4 border-l-4 pl-2">
        <MarkdownTree parseTree={parseTreeNode.child} />
      </blockquote>
    )
  }

  // will never be reached:
  return <></>
}

function format(text: string, parameters?: ReactNode[]): string {
  if (parameters) {
    parameters.forEach((p, index) => {
      if (typeof p === "string") {
        text = text.replace(`{{${index}}}`, p)
      }
    })
  }
  return text
}
