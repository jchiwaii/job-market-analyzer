import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import UserProfile from "@/components/UserProfile";
import AppFooter from "@/components/AppFooter";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Kenya Job Market Analyzer",
  description:
    "Analyze job market trends in Kenya using data scraped from MyJobMag",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${urbanist.variable} antialiased`}
      >
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl px-3 py-4 pt-14 sm:px-4 sm:py-6 sm:pt-16 lg:px-8 lg:pt-6">
              <div className="mb-5 flex justify-end sm:mb-6">
                <UserProfile
                  name="John Chiwai"
                  imageUrl="https://media.licdn.com/dms/image/v2/D4D03AQFw6mJE1jdVgQ/profile-displayphoto-shrink_800_800/B4DZS2CuHvHkAg-/0/1738220955588?e=1775088000&v=beta&t=BVvSXxGyL5sLKVy09ULJ7XPge1KSi_YVjfT8PsxVTSs"
                  profileUrl="https://www.linkedin.com/in/john-chiwai/"
                />
              </div>
              {children}
              <AppFooter />
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
