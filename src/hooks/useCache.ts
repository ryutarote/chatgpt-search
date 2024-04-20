import { useCallback } from 'react';

// Custom hook for interacting with the browser's cache storage
export default function useCache(cacheName: string) {
	// Function to get JSON data from the cache storage
	const cacheGetJson = useCallback(
		async (key: string) => {
			const cache = await caches.open(cacheName);
			const response = await cache.match(key);
			// Return the parsed JSON data from the response, or null if not found
			return response ? await response.json() : null;
		},
		[cacheName]
	);

	// Function to store JSON data in the cache storage
	const cachePutJson = useCallback(
		async (json: any, key: string) => {
			const cache = await caches.open(cacheName);
			// Create a new response object from the JSON data
			const response = new Response(JSON.stringify(json), {
				headers: {
					'Content-Type': 'application/json',
				},
			});
			// Store the response object in the cache with the given key
			await cache.put(key, response);
		},
		[cacheName]
	);

	// Function to store a file in the cache storage
	const cachePutFile = useCallback(
		async (file: File, key: string) => {
			const cache = await caches.open(cacheName);
			// Create a new response object from the file
			const response = new Response(file, {
				headers: {
					'Content-Type': file.type,
				},
			});
			// Store the response object in the cache with the given key
			await cache.put(key, response);
		},
		[cacheName]
	);

	return { cacheGetJson, cachePutJson, cachePutFile };
}
