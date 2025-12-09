import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME, APP_DESCRIPTION } from "@/constants";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - Smart Waste Collection for Panabo City`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "waste collection",
    "Panabo City",
    "eco-friendly",
    "garbage pickup",
    "waste management",
    "recycling",
    "Davao del Norte",
  ],
  authors: [{ name: `${APP_NAME} Team` }],
  openGraph: {
    type: "website",
    locale: "en_PH",
    siteName: APP_NAME,
    title: `${APP_NAME} - Smart Waste Collection for Panabo City`,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - Smart Waste Collection for Panabo City`,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
