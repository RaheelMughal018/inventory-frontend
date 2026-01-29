interface SimpleComponentCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    desc?: string;
    extra?: React.ReactNode; // search, filters, badges, etc.
  }
  
  const SimpleComponentCard: React.FC<SimpleComponentCardProps> = ({
    title,
    children,
    className = "",
    desc = "",
    extra,
  }) => {
    return (
      <div
        className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
      >
        {/* Header */}
        <div className="px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              {title}
            </h3>
            {desc && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {desc}
              </p>
            )}
          </div>
  
          {/* Optional right-side content */}
          {extra && (
            <div className="flex items-center gap-3">
              {extra}
            </div>
          )}
        </div>
  
        {/* Body */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    );
  };
  
  export default SimpleComponentCard;
  