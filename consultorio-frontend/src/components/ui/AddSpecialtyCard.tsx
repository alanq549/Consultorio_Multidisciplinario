interface AddSpecialtyCardProps {
  onClick: () => void;
}

export const AddSpecialtyCard: React.FC<AddSpecialtyCardProps> = ({ onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white/65 dark:bg-teal-800/30 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-teal-400 dark:hover:border-teal-500 transition-colors duration-200 p-6 w-full flex flex-col items-center justify-center cursor-pointer h-full min-h-[180px] hover:shadow-sm group"
  >
    <div className="bg-teal-100 dark:bg-teal-900/30 rounded-full p-3 mb-3 group-hover:bg-teal-200 dark:group-hover:bg-teal-800 transition-colors">
      <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
      Agregar especialidad
    </h3>
  </div>
);