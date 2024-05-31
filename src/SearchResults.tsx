import { useMemo } from 'preact/hooks'
import MiniSearch from 'minisearch'
import TinySegmenter from 'tiny-segmenter'
import { Typography, List, ListItem, ListItemText, Link } from '@mui/material'

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
  const miniSearch = useMemo(() => {
    const search = new MiniSearch({
      fields: ['title', 'text'],
      storeFields: ['id', 'title', 'time'],
      processTerm: (term, _fieldName) => {
        // Tokenize using tiny-segmenter if the term includes Japanese characters
        return (term.match(
          /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF]/
        ) != null)
          ? segmenter.segment(term)
          : term.split(/\s+/) // Fallback to whitespace tokenizer for other languages
      }
    })

    // Preprocess the text for each conversation
    const processedConversations = conversations.map((conv) => {
      const segmentedText = segmenter.segment(conv.text).join(' ')
      const segmentedTitle = segmenter.segment(conv.title).join(' ')

      return {
        ...conv,
        text: segmentedText,
        title: segmentedTitle
      }
    })
    search.addAll(processedConversations)
    return search
  }, [conversations])

  const results = miniSearch.search(input, { prefix: true, fuzzy: 0.4 }) || []

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
