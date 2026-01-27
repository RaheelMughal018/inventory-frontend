import Button from "../../components/ui/button/Button";
import { BoxIcon } from "../../icons";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
  exportButtonText?: string; // For CSV export
  addButtonText?: string; // For add button
  onExportClick?: () => void; // Export handler
  onAddClick?: () => void; // Add handler
  extra?: React.ReactNode; // Custom header content (filters, search)
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  // Default values if not provided
  exportButtonText = "Export CSV", // Default fallback
  addButtonText = "Add Item", // Default fallback
  onExportClick,
  onAddClick,
  extra,
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}

      <div className="px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            {title}
          </h3>
          {desc && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {desc}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-end">
          {extra}
          {/* Export Button */}
          <Button
            size="sm"
            variant="primary"
            endIcon={<BoxIcon className="size-5" />}
            onClick={onExportClick}
            // disabled={!onExportClick} // Disable if no handler
          >
            {exportButtonText} {/* ← Dynamic text! */}
          </Button>

          {/* Add Button */}
          <Button
            size="sm"
            variant="primary"
            endIcon={<BoxIcon className="size-5" />}
            onClick={onAddClick}
            // disabled={!onAddClick} // Disable if no handler
          >
            {addButtonText} {/* ← Dynamic text! */}
          </Button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
