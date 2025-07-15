import { Card, Center, Loader, useMantineColorScheme } from '@mantine/core'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import '@/styles/github-markdown.css'
import classes from './server.module.css'

import { useGetRawGithubFileQuery } from '@/hooks/queries/useServerQueries'

type ServerContentProps = {
  serverId: string
}

function ServerContent({ serverId }: ServerContentProps) {
  const { data: rawGithubFile, isLoading } = useGetRawGithubFileQuery(serverId)
  const { colorScheme } = useMantineColorScheme()

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    )
  }

  return (
    <Card className={classes.markdownCard} data-theme={colorScheme}>
      <div className="markdown markdown-body" data-theme={colorScheme}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          skipHtml={false}
        >
          {rawGithubFile}
        </ReactMarkdown>
      </div>
    </Card>
  )
}

export default ServerContent
