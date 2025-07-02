import { useState } from "react";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import styles from "./styles.module.scss";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  tabIndex?: number;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Mật khẩu",
  className,
  disabled,
  tabIndex,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.container}>
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${styles.input} ${className}`}
        disabled={disabled}
        tabIndex={tabIndex}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className={styles.toggleButton}
        disabled={disabled}
      >
        {showPassword ? (
          <EyeOffIcon className={styles.icon} />
        ) : (
          <EyeIcon className={styles.icon} />
        )}
      </button>
    </div>
  );
}
