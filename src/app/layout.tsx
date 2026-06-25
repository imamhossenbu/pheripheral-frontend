import type { Metadata } from "next";
import "@/app/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Periphex - IT Asset & Peripheral Management",
  description: "Advanced lifecycle tracking, analytics, and notification system for company peripheral equipment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            {children}
          </CartProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#1a1d24',
                border: '1px solid #dcd8cb',
                borderRadius: '8px',
                padding: '12px 20px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              },
              success: {
                style: {
                  borderLeft: '4px solid #3a7d49',
                },
                iconTheme: {
                  primary: '#3a7d49',
                  secondary: '#ffffff',
                },
              },
              error: {
                style: {
                  borderLeft: '4px solid #b5392e',
                },
                iconTheme: {
                  primary: '#b5392e',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
