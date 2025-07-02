import { ReactNode } from "react";

interface EmptyStateProps {
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

/**
 * A reusable empty state component
 */
export default function EmptyState({
  message = "Không có từ vựng nào trong danh sách này",
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4">{icon}</div>}

      <p className="text-gray-500 mb-4">{message}</p>

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
