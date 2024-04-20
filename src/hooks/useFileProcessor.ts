import { useCallback } from 'react';
import JSZip from 'jszip';

interface Conversation {
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

// Custom hook for processing files containing conversation data
export default function useFileProcessor() {
	// Function to read a file input and return its contents as an ArrayBuffer
	const readFileFromInput = useCallback(
		async (file: File): Promise<ArrayBuffer> => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
				reader.onerror = (e) => reject(e.target?.error);
				reader.readAsArrayBuffer(file);
			});
		},
		[]
	);

	// Function to process a file input and extract conversation data from a zip file
	const processFile = useCallback(
		async (file: File): Promise<Conversation[]> => {
			// Read the file and load the zip archive
			const buffer = await readFileFromInput(file);
			const zip = await JSZip.loadAsync(buffer);

			// Extract JSON data from the zip file and parse it
			const text = await zip.file('conversations.json')?.async('text');
			const json = JSON.parse(text ?? '');

			// Convert and sort the conversation data
			return json.map(mapConversation).sort(sortConversation);
		},
		[readFileFromInput]
	);

	// Return the function to process a file
	return { processFile };
}

// Helper function to convert a conversation object to a Conversation type
function mapConversation(conversation: any): Conversation {
	const messages = Object.values(conversation.mapping)
		.filter((m: any) => m.message)
		.map(mapMessage);

	// Convert the conversation object and include mapped messages
	return {
		title: conversation.title,
		messages,
		time: conversation.create_time,
		id: conversation.conversation_id,
		updated: conversation.update_time,
		text: messages.map((m) => `[${m.author}] ${m.text}`).join('\n'),
	};
}

// Helper function to convert a message object to a Message type
function mapMessage(value: any): Message {
	const { message } = value;
	const author = message.author.role;
	const text = message.content.parts?.join(' ');

	// Return a Message object
	return { author, text };
}

// Helper function to sort Conversation objects by their time property
function sortConversation(a: Conversation, b: Conversation): number {
	return a.time - b.time; // Ascending order
}
