import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://playwordshift.com";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/profil", // User profiles are private
                ],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
