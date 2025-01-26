import { AVAILABLE_MODELS, type GroqModel } from '../config';
import { setModel } from '../lib/groq';

export function ModelSelector() {
	return (
		<select
			onChange={(e) => setModel(e.target.value as GroqModel)}
			className="rounded-md border border-gray-300 dark:border-gray-600 
					 py-1 px-1 text-sm sm:text-base bg-white dark:bg-gray-700 
					 text-gray-900 dark:text-gray-100 
					 w-[80px] sm:w-[200px] truncate"
			defaultValue="llama-3.3-70b-versatile"
		>
			{AVAILABLE_MODELS.map((model) => (
				<option key={model.id} value={model.id} className="truncate text-sm">
					<span className="hidden sm:inline">{model.displayName}</span>
					<span className="sm:hidden">{model.displayName.split(' ')[0]}</span>
				</option>
			))}
		</select>
	);
}
