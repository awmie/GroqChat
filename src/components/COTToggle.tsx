import { useState } from 'react';
import { toggleCOT } from '../lib/groq';

export function COTToggle() {
	const [enabled, setEnabled] = useState(false);

	const handleClick = () => {
		const newState = !enabled;
		setEnabled(newState);
		toggleCOT(newState);
	};

	return (
		<button
			onClick={handleClick}
			className={`
				px-4 py-2 rounded-md font-medium text-sm
				transition-colors duration-200
				${enabled 
					? 'bg-blue-500/80 text-white hover:bg-blue-600/90' 
					: 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/90 dark:bg-gray-700/50 dark:text-gray-200 dark:hover:bg-gray-600/60'
				}
				focus:outline-none
				focus-visible:ring-1 focus-visible:ring-gray-400/30 dark:focus-visible:ring-gray-500/30
			`}
		>
			Chain of Thought
		</button>
	);
}
