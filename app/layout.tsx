import type { Metadata } from "next";
import ThemeProvider from "@/components/theme-provider";
import TopBar from "@/components/top-bar";
import FloatingDock from "@/components/floating-dock";
import BackgroundOrbs from "@/components/background-orbs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Knowledge AI — Multi-Agent 智能调研助手",
  description: "基于多 Agent 协作的智能调研与知识库助手，支持知识库检索、联网搜索、数据分析、报告生成、邮件发送",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="h-full flex flex-col bg-slate-50 dark:bg-[#0b1120] relative transition-colors duration-300">
        <ThemeProvider>
          <BackgroundOrbs />
          <TopBar />
          <main className="flex-1 min-h-0 overflow-hidden pt-12 pb-20 relative z-10">
            {children}
          </main>
          <FloatingDock />
        </ThemeProvider>
      </body>
    </html>
  );
}
