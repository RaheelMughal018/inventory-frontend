import { ReactNode } from "react";

interface OverviewMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "muted";
}

const variantStyles = {
  default: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white/90",
  success: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
  warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300",
  error: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
  muted: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
};

export default function OverviewMetricCard({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
}: OverviewMetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] md:p-5">
      {icon && (
        <div
          className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${variantStyles[variant]}`}
        >
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white tabular-nums">
        {value}
      </p>
      {subtitle != null && subtitle !== "" && (
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}
