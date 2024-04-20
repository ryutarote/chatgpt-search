import { useMemo } from "preact/hooks";
import MiniSearch from "minisearch";
import { Typography, List, ListItem, ListItemText, Link } from "@mui/material";

export interface Conversation {
  title: string;
  messages: Message[];
  time: number;
  id: string;
  updated: number;
  text: string;
}

interface Message {
  author: string;
  text: string;
}

export default function SearchResults({
  input,
  conversations,
}: {
  input: string;
  conversations: Conversation[];
}) {
  // Memoize the MiniSearch instance to avoid unnecessary recalculations
  const miniSearch = useMemo(() => {
    const search = new MiniSearch({
      fields: ["title", "text"],
      storeFields: ["id", "title", "time"],
    });
    search.addAll(conversations);
    return search;
  }, [conversations]);

  // Perform the search and retrieve results
  const results = miniSearch.search(input) || [];

  return (
    <div>
      {/* Display the number of conversations found */}
      <Typography variant="subtitle1">
        Found {results.length} out of {conversations.length} conversations.
      </Typography>

      {/* Display search results using a List component */}
      <List>
        {results.map((c) => (
          <ListItem
            key={c.id}
            underline="hover"
            component={Link}
            href={`https://chat.openai.com/c/${c.id}`}
          >
            {/* Display conversation title */}
            <ListItemText primary={c.title} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}
