import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface ScrollToTopProviderProps {
  children: React.ReactNode;
}

export function ScrollToTopProvider({ children }: ScrollToTopProviderProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return <>{children}</>;
}
