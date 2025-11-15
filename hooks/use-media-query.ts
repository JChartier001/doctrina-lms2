'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(() => {
		if (typeof window === 'undefined') return false;
		return window.matchMedia(query).matches;
	});

	useEffect(() => {
		const media = window.matchMedia(query);
		const listener = () => setMatches(media.matches);
		media.addEventListener('change', listener);

		const t = setTimeout(() => setMatches(media.matches), 0);

		return () => {
			clearTimeout(t);
			media.removeEventListener('change', listener);
		};
	}, [query]);

	return matches;
}
