import { AVAILABLE_MODELS, type GroqModel } from '../config';
import { setModel } from '../lib/groq';

export function ModelSelector() {
	const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setModel(event.target.value as GroqModel);
	};

	return (
		<div className="flex items-center gap-2">
			<label htmlFor="model-select" className="text-sm font-medium text-gray-900 dark:text-gray-100">
				Model:
			</label>
			<select
				id="model-select"
				onChange={handleModelChange}
				className="rounded-md border border-gray-300 dark:border-gray-600 p-1 text-sm 
						 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-w-[200px]"
				defaultValue="llama-3.3-70b-versatile"
			>
				{AVAILABLE_MODELS.map((model) => (
					<option key={model.id} value={model.id}>
						{model.displayName} ({model.provider} - {model.contextWindow.toLocaleString()} ctx)
					</option>
				))}
			</select>
		</div>
	);
}