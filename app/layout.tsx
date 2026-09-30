import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="font-sans" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
