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
				px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-sm sm:text-base font-medium
				min-w-[35px] sm:min-w-[50px] transition-colors duration-200
				${enabled 
					? 'bg-blue-500/80 text-white hover:bg-blue-600/90' 
					: 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/90 dark:bg-gray-700/50 dark:text-gray-200 dark:hover:bg-gray-600/60'
				}
				focus:outline-none
			`}
		>
			{/* Show shorter text on mobile */}
			<span className="sm:hidden">CT</span>
			<span className="hidden sm:inline">CoT</span>
		</button>
	);
}

