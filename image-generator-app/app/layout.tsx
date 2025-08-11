import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GenPic | AI-Powered Image Generator",
  description:
    "Generate stunning AI-powered images instantly with GenPic. Customize styles, prompts, and resolutions to bring your ideas to life.",
  keywords: [
    "AI image generator",
    "AI art",
    "text to image",
    "GenPic",
    "image creation",
    "Technioz",
  ],
  authors: [{ name: "Technioz", url: "https://technioz.com" }],
  creator: "Technioz",
  publisher: "Technioz",
  metadataBase: new URL("https://genpic.technioz.com"),
  openGraph: {
    title: "GenPic | AI-Powered Image Generator",
    description:
      "Create beautiful AI-generated images in seconds. No design skills needed — just your imagination.",
    url: "https://genpic.technioz.com",
    siteName: "GenPic",
    images: [
      {
        url: "https://genpic.technioz.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GenPic AI Image Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GenPic | AI-Powered Image Generator",
    description:
      "Generate high-quality AI images instantly with GenPic. Fast, creative, and customizable.",
    images: ["https://genpic.technioz.com/og-image.jpg"],
    creator: "@technioz",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Technioz",
  url: "https://technioz.com",
  logo: "https://technioz.com/logo.png",
  description:
    "Technioz is a leading global software development company specializing in custom web applications, mobile app development, AI-powered solutions, and digital transformation consulting for businesses worldwide.",
  founder: [
    {
      "@type": "Person",
      name: "Gaurav Bhatia",
    },
    {
      "@type": "Person",
      name: "Pallavi Mishra",
    },
  ],
  foundingDate: "2025-03-01",
  address: {
    "@type": "PostalAddress",
    streetAddress: "105/2 Bhargo nagar, Jalandhar",
    addressLocality: "Jalandhar",
    addressRegion: "PB",
    postalCode: "144001",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "info@technioz.com",
    areaServed: "Worldwide",
  },
  sameAs: [
    "https://www.linkedin.com/company/technioz",
    "https://twitter.com/technioz",
    "https://github.com/technioz",
    "https://instagram.com/technioz",
    "https://facebook.com/technioz", // Add only if it exists
  ],
};
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Technioz",
  url: "https://technioz.com",
  logo: "https://technioz.com/logo.png",
  description:
    "Technioz is a trusted software development company based in Jalandhar, Punjab, offering custom web, mobile, and AI-powered solutions for businesses in India and globally.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "105/2 Bhargo Nagar",
    addressLocality: "Jalandhar",
    addressRegion: "Punjab",
    postalCode: "144001",
    addressCountry: "IN",
  },
  openingHours: "Mo-Fr 09:00-18:00",
  geo: {
    "@type": "GeoCoordinates",
    latitude: "31.3260", // Approx for Jalandhar
    longitude: "75.5762",
  },
  sameAs: [
    "https://www.linkedin.com/company/technioz",
    "https://twitter.com/technioz",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
