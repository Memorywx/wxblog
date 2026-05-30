'use client'

import { isValidElement, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { Check, Copy } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Props {
  content: string
}

const softCodeText = 'hsl(220, 14%, 76%)'
const mutedCodeText = 'hsl(220, 10%, 54%)'
const accentText = 'hsl(214, 24%, 68%)'
const warmText = 'hsl(34, 26%, 70%)'
const keywordText = 'hsl(271, 38%, 74%)'
const stringText = 'hsl(103, 28%, 70%)'
const numberText = 'hsl(34, 52%, 69%)'

const customOneDark = {
  ...oneDark,
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    color: softCodeText,
  },
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    color: softCodeText,
  },
  comment: {
    color: mutedCodeText,
    fontStyle: 'italic',
  },
  prolog: {
    color: mutedCodeText,
  },
  cdata: {
    color: mutedCodeText,
  },
  punctuation: {
    color: accentText,
  },
  entity: {
    color: accentText,
  },
  variable: {
    color: softCodeText,
  },
  keyword: {
    color: keywordText,
  },
  operator: {
    color: accentText,
  },
  function: {
    color: warmText,
  },
  'class-name': {
    color: warmText,
  },
  builtin: {
    color: warmText,
  },
  selector: {
    color: accentText,
  },
  property: {
    color: accentText,
  },
  'attr-name': {
    color: accentText,
  },
  tag: {
    color: accentText,
  },
  symbol: {
    color: accentText,
  },
  boolean: {
    color: warmText,
  },
  constant: {
    color: warmText,
  },
  number: {
    color: numberText,
  },
  atrule: {
    color: numberText,
  },
  string: {
    color: stringText,
  },
  char: {
    color: stringText,
  },
  regex: {
    color: stringText,
  },
  'attr-value': {
    color: stringText,
  },
  url: {
    color: accentText,
  },
  '.language-css .token.function': {
    color: warmText,
  },
  '.language-css .token.url > .token.function': {
    color: warmText,
  },
  '.language-markdown .token.url > .token.content': {
    color: accentText,
  },
  '.language-markdown .token.url > .token.url': {
    color: accentText,
  },
  '.language-markdown .token.url-reference.url': {
    color: accentText,
  },
  '.language-markdown .token.url-reference.url > .token.string': {
    color: accentText,
  },
  '.language-javascript .token.operator': {
    color: accentText,
  },
  '.language-json .token.operator': {
    color: accentText,
  },
  '.language-json .token.null.keyword': {
    color: numberText,
  },
  '.rainbow-braces .token.token.punctuation.brace-level-3': {
    color: accentText,
  },
  '.rainbow-braces .token.token.punctuation.brace-level-7': {
    color: accentText,
  },
  '.rainbow-braces .token.token.punctuation.brace-level-11': {
    color: accentText,
  },
} as const

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false)

  if (!isValidElement(children)) {
    return <pre>{children}</pre>
  }

  const codeElement = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>
  const className = codeElement.props.className || ''
  const language = className.replace('language-', '').trim() || undefined
  const code = String(codeElement.props.children || '').replace(/\n$/, '')

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="code-block">
      <div className="code-block__toolbar">
        <span className="code-block__language">{language || 'code'}</span>
        <button type="button" onClick={handleCopy} className="code-block__copy" aria-label="复制代码">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? '已复制' : '复制代码'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={customOneDark}
        PreTag="div"
        showLineNumbers
        wrapLongLines
        customStyle={{
          margin: 0,
          padding: '0.9rem 0',
          background: 'transparent',
          fontSize: '0.96rem',
          lineHeight: '1.8',
        }}
        codeTagProps={{ className: 'code-block__code' }}
        lineNumberStyle={{
          minWidth: '2.5rem',
          paddingRight: '1rem',
          textAlign: 'right',
          color: 'rgba(255,255,255,0.28)',
          fontSize: '0.88rem',
          userSelect: 'none',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export default function MarkdownRenderer({ content }: Props) {
  return (
    <div className="prose-custom">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['anchor-link'] } }],
        ]}
        components={{
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
