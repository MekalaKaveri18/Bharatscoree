import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

import Footer from "@/components/Footer";
import BorrowerDashboard from "./components/dashboard/BorrowerDashboard";
import LenderDashboard from "./components/dashboard/LenderDashboard";
import AdminDashboard from "./components/dashboard/AdminDashboard";

const queryClient = new QueryClient();

/* ---------------- AUTH GUARD ---------------- */
const RequireAuth = ({
  children,
  allowedRole,
}: {
  children: JSX.Element;
  allowedRole?: "borrower" | "lender" | "admin";
}) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toLowerCase();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/* ---------------- APP ---------------- */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* 🔔 Toasts (non-blocking UI) */}
      <div className="pointer-events-none fixed inset-0 z-[9999]">
        <Toaster />
        <Sonner />
      </div>

      <BrowserRouter>
        <div className="flex flex-col min-h-screen pointer-events-auto">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Role-based dashboards */}
            <Route
              path="/borrower"
              element={
                <RequireAuth allowedRole="borrower">
                  <BorrowerDashboard />
                </RequireAuth>
              }
            />

            <Route
              path="/lender"
              element={
                <RequireAuth allowedRole="lender">
                  <LenderDashboard user={undefined} />
                </RequireAuth>
              }
            />

            <Route
              path="/admin"
              element={
                <RequireAuth allowedRole="admin">
                  <AdminDashboard />
                </RequireAuth>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
