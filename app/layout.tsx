import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinHome — Mua nhà an toàn, sống an yên",
  description:
    "FinHome giúp bạn chọn đúng nhà, vay đúng sức: xác định vùng mua nhà an toàn, đánh giá khả năng vay và mở khóa la bàn định hướng tài chính.",
  icons: { icon: "/images/qiB3oKKzF4BijpvumvHCnb6KFvw.png" },
  openGraph: {
    title: "FinHome",
    description: "FinHome giúp bạn chọn đúng nhà, vay đúng sức.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
