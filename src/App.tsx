import { useState, useEffect } from 'preact/hooks';
import {
	TextField,
	Button,
	Typography,
	Container,
	CircularProgress,
	Input,
} from '@mui/material';
import useCache from './hooks/useCache';
import useFileProcessor from './hooks/useFileProcessor';
import SearchResults, { Conversation } from './SearchResults';

export default function App() {
	// Custom hooks for cache management and file processing
	const { cacheGetJson, cachePutJson, cachePutFile } = useCache('myCache');
	const { processFile } = useFileProcessor();

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function initConversations() {
			const json = await cacheGetJson('json');
			setConversations(json || []);
			setLoading(false);
		}
		initConversations();
	}, [cacheGetJson]);

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = (e.target as HTMLInputElement)?.files?.[0];
		if (!file) return;
		const conversations = await processFile(file);
		setConversations(conversations);
		await cachePutFile(file, 'file');
		await cachePutJson(conversations, 'json');
	};

	return (
		<Container
			className={`app ${conversations.length ? 'loaded' : 'loading'}`}
			maxWidth='md'
		>
			<Typography variant='h4' gutterBottom>
				ChatGPT Search
			</Typography>
			{loading ? (
				<CircularProgress />
			) : (
				<>
					{conversations.length === 0 ? (
						<Typography>
							Visit{' '}
							<a
								href='https://chat.openai.com/#settings/DataControls'
								target='_blank'
								rel='noopener noreferrer'
							>
								ChatGPT » Export data
							</a>{' '}
							to upload conversations as a zip file.
						</Typography>
					) : (
						<>
							<TextField
								label='Search'
								variant='outlined'
								autoFocus
								fullWidth
								value={input}
								onChange={(e) => setInput((e.target as HTMLInputElement).value)}
							/>
							<SearchResults input={input} conversations={conversations} />
						</>
					)}
					<Button
						component='label'
						variant='contained'
						color='primary'
						style={{ marginTop: '1rem' }}
					>
						Upload ChatGPT Zip File
						<Input
							type='file'
							accept='.zip'
							style={{ display: 'none' }}
							onChange={handleFileUpload}
						/>
					</Button>
				</>
			)}
		</Container>
	);
}
