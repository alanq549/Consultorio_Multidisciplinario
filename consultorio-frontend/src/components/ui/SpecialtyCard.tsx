interface Props {
  name: string;
  description: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SpecialtyCard: React.FC<Props> = ({ name, description, onEdit, onDelete }) => (
  <div className="bg-white dark:bg-teal-800/40 rounded-lg border border-gray-200 dark:border-teal-700 shadow-sm hover:shadow transition-shadow duration-200 p-6 w-full">
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-4">
        <div className="bg-teal-100 dark:bg-zinc-950/40 rounded-lg p-2 mr-3">
          <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{name}</h3>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">
        {description || "Sin descripción"}
      </p>
      
      {(onEdit || onDelete) && (
        <div className="flex justify-end gap-2 mt-auto">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="inline-flex items-center text-sm text-teal-600 dark:text-gray-50 hover:text-teal-800 dark:hover:text-teal-300 px-3 py-1 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
          )}
          {onDelete && (
            <button 
              onClick={onDelete}
              className="inline-flex items-center text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  </div>
);