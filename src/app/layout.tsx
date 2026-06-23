import type { Metadata } from "next";
import "@/app/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";

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
            {children}
          </CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#161e38',
                color: '#f8fafc',
                border: '1px solid #293681',
              },
              success: {
                iconTheme: {
                  primary: '#4274D9',
                  secondary: '#f8fafc',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
