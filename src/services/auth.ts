// import { googleProvider, auth as firebaseAuth } from "@/lib/firebase";
// import { signInWithPopup } from "firebase/auth";
import { User } from "@/lib/types";
import { api, api_version } from "@/services/api-client";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
interface AuthResponse {
  user: User;
  token: string;
}

// interface GoogleUserInfo  {
//   sub: string;
//   email: string;
//   name: string;
//   picture: string;
// }

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

const handleAuthError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    throw new AuthError(
      error.response?.data?.message || "Authentication failed",
    );
  }
  throw new AuthError("An unexpected error occurred");
};

export const auth = {
  signIn: async (email: string, password: string) => {
    try {
      const data: any = await api.post(`/${api_version}/Account/login`, {
        email,
        password,
      });
      return {
        user: {
          id: data.account.id,
          email: data.account.email,
          username: data.account.userName,
          phone: data.account.numberPhone,
          token: uuidv4(),
        },
      };
    } catch (error) {
      handleAuthError(error);
    }
  },

  signInWithGoogle: async () => {
    try {
      // const result = await signInWithPopup(firebaseAuth, googleProvider);
      // const user = result.user;
      // const { data } = await axios.post<AuthResponse>(
      //   `${import.meta.env.VITE_API_URL}/auth/login`,
      //   {
      //     email: user.email,
      //     password: user.uid,
      //   }
      // );
      // localStorage.setItem("token", data.token);
      // return data;

      // TODO: Implement this
      return {
        user: { id: "1", email: "user@example.com" },
        token: "1234567890",
      };
    } catch (error) {
      handleAuthError(error);
    }
  },

  signUp: async (
    email: string,
    password: string,
    phone: string,
    username: string,
  ) => {
    try {
      const data: any = await api.post(`/${api_version}/Account`, {
        email,
        password,
        username,
        phoneNumber: phone,
      });
      return {
        user: {
          id: data.id,
          email: data.email,
          username: data.userName,
          phone: data.numberPhone,
          token: data.token,
        },
      };
    } catch (error) {
      handleAuthError(error);
    }
  },

  signOut: async (): Promise<void> => {
    try {
      // You might want to call your backend to invalidate the token
      // await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`);
      localStorage.removeItem("user");
    } catch (error) {
      handleAuthError(error);
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem("user");
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },

  refreshToken: async () => {
    try {
      const { data } = await axios.post<AuthResponse>(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
      );
      localStorage.setItem("token", data.token);
      return data;
    } catch (error) {
      handleAuthError(error);
    }
  },
};
