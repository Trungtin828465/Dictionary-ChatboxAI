import { isAxiosError } from "axios";

// Type for toast function based on your existing useToast hook
interface ToastOptions {
  title: string;
  description: string;
  variant?: "default" | "destructive";
}

type ToastFunction = (options: ToastOptions) => void;

/**
 * A standardized error handler for API errors
 * @param error The error object from try/catch
 * @param toast The toast function from useToast hook
 * @param customMessage Optional custom error message to display
 * @returns The error message string
 */
export function handleApiError(
  error: unknown,
  toast: ToastFunction,
  customMessage?: string,
): string {
  let errorMsg = customMessage || "Đã xảy ra lỗi không mong muốn";

  if (isAxiosError(error)) {
    // Extract error message from response if available
    const responseMessage = error.response?.data?.message;
    errorMsg = responseMessage || errorMsg;

    // Log detailed error information
    console.error(
      `API Error (${error.response?.status}):`,
      error.response?.data || error.message,
      {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
      },
    );
  } else if (error instanceof Error) {
    // Handle standard JavaScript errors
    errorMsg = error.message || errorMsg;
    console.error("Error:", error);
  } else {
    // Handle unknown error types
    console.error("Unexpected error:", error);
  }

  // Show toast notification
  toast({
    title: "Lỗi",
    description: errorMsg,
    variant: "destructive",
  });

  return errorMsg;
}

/**
 * Creates a loading state manager for multiple loading states
 * @returns Functions to manage loading states
 */
export function createLoadingStateManager<T extends Record<string, boolean>>(
  initialStates: T,
) {
  let states = { ...initialStates };
  let setStates: React.Dispatch<React.SetStateAction<T>> | null = null;

  const setLoadingState = (key: keyof T, value: boolean) => {
    if (setStates) {
      setStates((prev) => ({ ...prev, [key]: value }));
    } else {
      states = { ...states, [key]: value };
    }
  };

  const registerSetStates = (
    setState: React.Dispatch<React.SetStateAction<T>>,
  ) => {
    setStates = setState;
    setState(states); // Sync any changes made before registration
  };

  return {
    states,
    setLoadingState,
    registerSetStates,
  };
}
