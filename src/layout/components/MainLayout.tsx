import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "@/shared/ui/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 animate-fadeIn">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
