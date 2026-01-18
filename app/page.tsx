import type { Metadata } from "next";
import { PAGE_METADATA, SITE_URL, generateOGMeta, generateTwitterMeta } from "@/lib/seo/config";
import HomeClient from "./HomeClient";

// Server-side metadata generation
export const metadata: Metadata = {
  title: PAGE_METADATA.home.tr.title,
  description: PAGE_METADATA.home.tr.description,
  openGraph: generateOGMeta(
    PAGE_METADATA.home.tr.title,
    PAGE_METADATA.home.tr.description,
    "/"
  ),
  twitter: generateTwitterMeta(
    PAGE_METADATA.home.tr.title,
    PAGE_METADATA.home.tr.description
  ),
  alternates: {
    canonical: SITE_URL,
    languages: {
      "tr-TR": SITE_URL,
      "en-US": `${SITE_URL}?lang=en`,
    },
  },
};

export default function Home() {
  return <HomeClient />;
}
