import { useMemo } from 'react'
import { Typography, List, ListItem, ListItemText, Link } from '@mui/material'
import TinySegmenter from 'tiny-segmenter'
import { Asearch, MatchMode } from './lib/assearch_browser'

// Initialize the TinySegmenter
const segmenter = new TinySegmenter()

export interface Conversation {
  title: string
  messages: Message[]
  time: number
  id: string
  updated: number
  text: string
}

interface Message {
  author: string
  text: string
}

export default function SearchResults ({
  input,
  conversations
}: {
  input: string
  conversations: Conversation[]
}) {
  const searchIndex = useMemo(() => {
    // Create a search index object
    const index = conversations.map((conv) => {
      const segmentedText = segmenter.segment(conv.text).join(' ')
      const segmentedTitle = segmenter.segment(conv.title).join(' ')

      return {
        ...conv,
        segmentedTitle,
        segmentedText
      }
    })
    return index
  }, [conversations])

  const results = useMemo(() => {
    if (!input) return []
    // Calculate the ambiguity level based on input length
    const ambiguity = Math.floor(input.length / 2)

    const searcher = new Asearch(input, MatchMode.Include)
    return searchIndex.filter((conv) => {
      const titleMatch = searcher.match(conv.segmentedTitle, ambiguity)
      const textMatch = searcher.match(conv.segmentedText, ambiguity)
      return titleMatch || textMatch
    })
  }, [input, searchIndex])

  return (
    <div>
      <Typography variant='subtitle1'>
        Found {results.length} out of {conversations.length} conversations.
      </Typography>
      <List
        style={{
				  maxHeight: '400px',
				  overflowY: 'auto'
        }}
      >
        {results.map((c) => (
          <ListItem
            key={c.id}
            underline='hover'
            component={Link}
            href={`https://chat.openai.com/c/${c.id}`}
          >
            <ListItemText primary={c.title} />
          </ListItem>
        ))}
      </List>
    </div>
  )
}
