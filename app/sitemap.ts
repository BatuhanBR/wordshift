import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://playwordshift.com";

export default function sitemap(): MetadataRoute.Sitemap {
    const currentDate = new Date().toISOString();

    // Static pages
    const staticPages = [
        {
            url: `${BASE_URL}`,
            lastModified: currentDate,
            changeFrequency: "daily" as const,
            priority: 1.0,
        },
        // Daily Play Pages
        {
            url: `${BASE_URL}/oyna`,
            lastModified: currentDate,
            changeFrequency: "daily" as const,
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/oyna/4`,
            lastModified: currentDate,
            changeFrequency: "daily" as const,
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/oyna/6`,
            lastModified: currentDate,
            changeFrequency: "daily" as const,
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/oyna/7`,
            lastModified: currentDate,
            changeFrequency: "daily" as const,
            priority: 0.8,
        },
        // Practice Pages
        {
            url: `${BASE_URL}/oyna/pratik`,
            lastModified: currentDate,
            changeFrequency: "weekly" as const,
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/oyna/pratik/4`,
            lastModified: currentDate,
            changeFrequency: "weekly" as const,
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/oyna/pratik/6`,
            lastModified: currentDate,
            changeFrequency: "weekly" as const,
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/oyna/pratik/7`,
            lastModified: currentDate,
            changeFrequency: "weekly" as const,
            priority: 0.6,
        },
        // Multiplayer
        {
            url: `${BASE_URL}/multiplayer`,
            lastModified: currentDate,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        },
        // Leaderboard
        {
            url: `${BASE_URL}/leaderboard`,
            lastModified: currentDate,
            changeFrequency: "hourly" as const,
            priority: 0.7,
        },
        // Info Pages
        {
            url: `${BASE_URL}/nasil-oynanir`,
            lastModified: currentDate,
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/shop`,
            lastModified: currentDate,
            changeFrequency: "weekly" as const,
            priority: 0.6,
        },
        // Legal Pages
        {
            url: `${BASE_URL}/gizlilik`,
            lastModified: currentDate,
            changeFrequency: "yearly" as const,
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/cerez-politikasi`,
            lastModified: currentDate,
            changeFrequency: "yearly" as const,
            priority: 0.3,
        },
        // Auth Pages
        {
            url: `${BASE_URL}/giris`,
            lastModified: currentDate,
            changeFrequency: "monthly" as const,
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/kayit`,
            lastModified: currentDate,
            changeFrequency: "monthly" as const,
            priority: 0.4,
        },
    ];

    return staticPages;
}
