import { LOCAL_MODELS, isModelLoaded, isLoading } from '../lib/local';

interface LocalModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  onLoadModel: () => void;
  progress?: string;
}

export function LocalModelSelector({ selectedModel, onModelChange, onLoadModel, progress }: LocalModelSelectorProps) {
  const modelLoaded = isModelLoaded();
  const loading = isLoading();

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        disabled={loading}
        className="rounded-md border border-gray-300 dark:border-gray-600 
           py-1 px-2 text-sm bg-white dark:bg-gray-700 
           text-gray-900 dark:text-gray-100 w-[150px]"
      >
        {LOCAL_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.displayName} ({model.size})
          </option>
        ))}
      </select>
      {!modelLoaded ? (
        <button
          onClick={onLoadModel}
          disabled={loading}
          className="px-3 py-1 text-sm rounded-md bg-green-500 text-white 
             hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Load Model'}
        </button>
      ) : (
        <span className="text-xs text-green-500 font-medium">✓ Loaded</span>
      )}
      {progress && loading && (
        <span className="text-xs text-blue-500 font-medium max-w-[150px] truncate">
          {progress}
        </span>
      )}
    </div>
  );
}
