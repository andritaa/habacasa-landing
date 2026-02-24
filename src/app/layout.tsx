import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HabaCasa — Your Space, Truly Smart",
  description: "AI-powered building management that lives on your premises. Private. Powerful. Personal.",
  openGraph: {
    title: "HabaCasa — Your Space, Truly Smart",
    description: "AI-powered building management that lives on your premises. Private. Powerful. Personal.",
    type: "website",
    url: "https://www.haba.casa",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" data-theme="midnight" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Inline script to restore theme before paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('hc-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
