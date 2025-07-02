import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import BG from "@/assets/icons/bg.svg?react";
import { Toaster } from "sonner";

export function RootLayout() {
  return (
    <div className="min-h-screen justify-between h-full flex flex-col w-screen bg-muted   pt-8">
      <div className="max-w-[78%] w-full mx-auto bg-white rounded-3xl px-12 py-8 h-full flex-1 pb-16">
        <Header />
        <main className="flex-1 relative isolate h-full">
          <div className="z-10">
            <Outlet />
          </div>

          <div className="absolute w-[130%] h-full top-2/4 left-2/4 -translate-x-1/2 -translate-y-1/2 -z-10">
            <BG className="w-full h-full" />
          </div>
          <Toaster />
        </main>
      </div>
      <Footer />
    </div>
  );
}
