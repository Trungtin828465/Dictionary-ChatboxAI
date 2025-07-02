import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialLoginButton } from "@/components/auth/SocialLoginButton";
import { Footer } from "@/layouts/Footer";
import BG from "@/assets/icons/bg.svg?react";
import TABLET_BG from "@/assets/icons/tablet_login.svg?react";
import SUCCESS_ICON from "@/assets/icons/success.svg?react";
import { useAuth } from "@/contexts/auth-context";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import styles from "./styles.module.scss";
import { AuthError } from "@/services/auth";
import { DEFAULT_PHONE_NUMBER } from "@/store";

interface SignInFormData {
  email: string;
  password: string;
}

export default function SignInPage() {
  const navigate = useNavigate();
  const { signIn, signUp, isLoading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<SignInFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<SignInFormData> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const user = await signIn(formData.email, formData.password);
      if (user) {
        toast({
          title: "Đăng nhập thành công!",
          description: "Đăng nhập thành công!",
          variant: "default",
          color: "success",
          action: <SUCCESS_ICON className={styles.successIcon} />,
        });
        navigate("/"); // Redirect to home page after successful login
      } else {
        toast({
          title: "Đăng nhập thất bại!",
          description: "Đăng nhập thất bại!",
          variant: "destructive",
          color: "error",
        });
      }
    } catch (error) {
      toast({
        title: "Đăng nhập thất bại!",
        description: "Đăng nhập thất bại!",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const response = await signInWithPopup(auth, googleProvider);
      const user = response.user;
      const userUid = user.uid!!;
      const userEmail = user.email!!;
      try {
        const userResponse = await signIn(userEmail, userUid);
        if (userResponse) {
          // Show success message
          toast({
            title: "Success!",
            description: "Đăng nhập thành công với Google!",
            variant: "default",
          });

          // Redirect to home page or dashboard
          navigate("/");
        } else {
          toast({
            title: "Error!",
            description: "Đăng nhập thất bại!",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error signing in with Google:", error);
        if (
          error instanceof AuthError &&
          error.message === "Tên tài khoản không tồn tại!"
        ) {
          const userResponse = await signUp(
            userEmail,
            userUid,
            user.phoneNumber || DEFAULT_PHONE_NUMBER,
            user.displayName?.split(" ").join("") || "",
          );
          if (userResponse) {
            navigate("/");
            toast({
              title: "Success!",
              description: "Đăng nhập thành công với Google!",
              variant: "default",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({
        title: "Error",
        description: "Lỗi đăng nhập với Google. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const updateFormData = (field: keyof SignInFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <AuthHeader
          linkText="Đăng Ký ngay"
          linkHref="/sign-up"
          description="Chưa có tài khoản"
        />

        <main className={styles.main}>
          <div className={styles.grid}>
            {/* Form Section */}
            <div className={styles.formSection}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <div>
                    <Input
                      type="text"
                      placeholder="Tên đăng nhập hoặc email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email")(e.target.value)}
                      className={`${styles.input} ${
                        errors.email ? styles.error : ""
                      }`}
                    />
                    {errors.email && (
                      <p className={styles.errorMessage}>{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <PasswordInput
                      value={formData.password}
                      onChange={updateFormData("password")}
                      className={errors.password ? styles.error : ""}
                    />
                    {errors.password && (
                      <p className={styles.errorMessage}>{errors.password}</p>
                    )}
                  </div>
                </div>

                <div className={styles.forgotPassword}>
                  <Link to="/forgot-password">Quên mật khẩu?</Link>
                </div>

                <Button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>

                <div className={styles.divider}>
                  <div>
                    <span>hoặc</span>
                  </div>
                </div>
              </form>
              <SocialLoginButton onGoogleSignIn={handleGoogleSignIn} />
            </div>

            {/* Illustration */}
            <div className={styles.illustration}>
              <TABLET_BG />
            </div>
          </div>
          <div className={styles.background}>
            <BG />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
