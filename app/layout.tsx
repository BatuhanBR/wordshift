import type { Metadata } from "next";
import Script from "next/script";
import { Fredoka } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { CookieConsent } from "@/components/CookieConsent";
import { Footer } from "@/components/Footer";
import { SITE_URL, SEO_CONFIG, SITE_NAME, FAQ_SCHEMA } from "@/lib/seo/config";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO_CONFIG.defaultTitle.tr,
    template: `%s | ${SITE_NAME}`,
  },
  description: SEO_CONFIG.defaultDescription.tr,
  keywords: SEO_CONFIG.keywords.tr,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  // Open Graph
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SEO_CONFIG.defaultTitle.tr,
    description: SEO_CONFIG.defaultDescription.tr,
    images: [
      {
        url: "/OGimage.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Wordle Kelime Oyunu`,
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: SEO_CONFIG.defaultTitle.tr,
    description: SEO_CONFIG.defaultDescription.tr,
    images: ["/OGimage.jpg"],
    creator: SEO_CONFIG.twitterHandle,
  },

  // Icons
  icons: {
    icon: "/favicon.jpg",
    apple: "/favicon.jpg",
  },

  // Verification (Add your codes when ready)
  // verification: {
  //   google: "your-google-verification-code",
  //   yandex: "your-yandex-verification-code",
  // },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Alternate languages
  alternates: {
    canonical: SITE_URL,
    languages: {
      "tr-TR": SITE_URL,
      "en-US": `${SITE_URL}?lang=en`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              alternateName: ["WordShift", "Türkçe Wordle", "Daily Word Game"],
              url: SITE_URL,
              description: SEO_CONFIG.defaultDescription.tr,
              inLanguage: ["tr-TR", "en-US"],
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/oyna?len={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* Structured Data - Game */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoGame",
              name: SITE_NAME,
              alternateName: "Wordle Kelime Oyunu",
              description: SEO_CONFIG.defaultDescription.tr,
              url: SITE_URL,
              genre: ["Puzzle", "Word Game", "Educational", "Trivia"],
              gamePlatform: ["Web Browser", "Mobile Web"],
              applicationCategory: "Game",
              operatingSystem: "Any",
              playMode: ["SinglePlayer", "MultiPlayer"],
              numberOfPlayers: {
                "@type": "QuantitativeValue",
                minValue: 1,
                maxValue: 2,
              },
              inLanguage: ["tr", "en"],
              image: `${SITE_URL}/OGimage.jpg`,
              author: {
                "@type": "Organization",
                name: SITE_NAME,
                url: SITE_URL,
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "TRY",
                availability: "https://schema.org/InStock",
              },
            }),
          }}
        />
        {/* Structured Data - FAQ for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ_SCHEMA.tr.map(faq => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer
                }
              }))
            }),
          }}
        />
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              sameAs: [
                "https://twitter.com/wordshiftgame",
              ]
            }),
          }}
        />
      </head>
      <body className={`${fredoka.className} antialiased text-[#4a4a4a] bg-[#fdf8f3] relative overflow-x-hidden min-h-screen flex flex-col`}>
        {/* Global Background Blobs */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#ff8c42]/40 blur-3xl opacity-100 mix-blend-multiply animate-blob" />
          <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] rounded-full bg-[#9b59b6]/40 blur-3xl opacity-100 mix-blend-multiply animate-blob animation-delay-2000" />
          <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full bg-[#3498db]/40 blur-3xl opacity-100 mix-blend-multiply animate-blob animation-delay-4000" />
        </div>

        <LanguageProvider>
          <AuthProvider>
            <AnalyticsProvider>
              <div className="flex-1">
                {children}
              </div>
              <Footer />
              <CookieConsent />
            </AnalyticsProvider>
          </AuthProvider>
        </LanguageProvider>
        {/* Umami Analytics */}
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="5e766215-a50a-49bb-a423-2768f445dd14"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
