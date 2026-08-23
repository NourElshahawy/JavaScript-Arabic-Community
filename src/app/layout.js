import "@/styles/globals.css";
import { IBM_Plex_Sans_Arabic } from "next/font/google";

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "JavaScript Arabic Community",
    template: "%s · JavaScript Arabic Community",
  },
  description: "مجتمع عربي لمطوري JavaScript: أسئلة وإجابات، نقاشات، أخبار، وتجارب انترفيو.",
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: "JavaScript Arabic Community",
  },
};

export const viewport = {
  themeColor: "#3457d5",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={plexArabic.variable}>
      <body>{children}</body>
    </html>
  );
}
