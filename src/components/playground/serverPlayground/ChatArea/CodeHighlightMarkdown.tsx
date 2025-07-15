import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeCodeHighlight from 'rehype-highlight'

interface CodeHighlightMarkdownProps {
  content: string
  components: any
}

function CodeHighlightMarkdown({
  content,
  components,
}: CodeHighlightMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeCodeHighlight]}
      skipHtml={false}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
}

export default CodeHighlightMarkdown
