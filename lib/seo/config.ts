// SEO Configuration for WordShift
// Optimized for: wordle kelime oyunu, günlük kelime, daily word game, word puzzle

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://playwordshift.com";
export const SITE_NAME = "WordShift";

// Primary target keywords for ranking
export const TARGET_KEYWORDS = {
    tr: [
        "wordle kelime oyunu",
        "wordle türkçe",
        "günlük kelime oyunu",
        "günlük kelime bulmacası",
        "kelime tahmin oyunu",
        "türkçe wordle",
        "online kelime oyunu",
        "ücretsiz kelime oyunu",
        "kelime bulmaca",
        "wordle oyna",
        "multiplayer kelime oyunu",
        "wordshift",
        // Long-tail keywords
        "çok oyunculu kelime oyunu",
        "arkadaşla kelime yarışması",
        "5 harfli kelime bulmaca sınırsız",
        "7 harfli kelime oyunu zor",
        "rekabetçi kelime oyunları",
        "kelime oyunu görev sistemi",
        "online arkadaşla oynanan kelime oyunu",
    ],
    en: [
        "daily word game",
        "word puzzle game",
        "wordle game online",
        "free word game",
        "word guessing game",
        "daily wordle",
        "multiplayer word game",
        "word game free",
        "online wordle",
        "wordshift",
        // Long-tail keywords
        "multiplayer wordle alternative",
        "4-7 letter word game online",
        "competitive word puzzle with quests",
        "wordle with friends real-time",
        "daily word shift puzzle",
        "wordshift multiplayer battle",
    ]
};

export const SEO_CONFIG = {
    siteName: {
        tr: "WordShift - Ücretsiz Kelime Oyunu",
        en: "WordShift - Free Word Game"
    },
    defaultTitle: {
        tr: "WordShift - Wordle Kelime Oyunu | Günlük Kelime Bulmacası",
        en: "WordShift - Daily Word Game | Free Word Puzzle Online"
    },
    defaultDescription: {
        tr: "WordShift ile wordle kelime oyunu oyna! Her gün yeni günlük kelime bulmacası. 4-5-6-7 harfli modlar, multiplayer yarışma, ELO sıralaması. Ücretsiz oyna!",
        en: "Play WordShift - the best daily word game! New word puzzle every day. 4-5-6-7 letter modes, multiplayer battles, ELO rankings. 100% free!"
    },
    keywords: {
        tr: TARGET_KEYWORDS.tr,
        en: TARGET_KEYWORDS.en,
    },
    author: "WordShift",
    twitterHandle: "@wordshiftgame",
};

// Page-specific metadata with keyword optimization
export const PAGE_METADATA = {
    home: {
        tr: {
            title: "WordShift - Wordle Kelime Oyunu | Günlük Kelime Bulmacası Oyna",
            description: "WordShift ile wordle kelime oyunu oyna! Her gün yeni günlük kelime bulmacası. Türkçe ve İngilizce 4-5-6-7 harfli modlar, multiplayer yarışmalar. Ücretsiz!"
        },
        en: {
            title: "WordShift - Daily Word Game | Free Word Puzzle Online",
            description: "Play WordShift - the ultimate daily word game! New word puzzle every day. 4-5-6-7 letter modes, multiplayer battles, ELO rankings. Completely free!"
        }
    },
    play: {
        tr: {
            title: "Günlük Kelime Oyunu Oyna | WordShift Wordle Bulmacası",
            description: "Günlük kelime oyunu oyna! Bugünün kelimesini 6 denemede tahmin et. Her gün yeni wordle bulmacası. WordShift ile ücretsiz oyna!"
        },
        en: {
            title: "Play Daily Word Puzzle | WordShift Word Game",
            description: "Play today's daily word puzzle! Guess the word in 6 tries. New word every day. Play free on WordShift!"
        }
    },
    play4: {
        tr: {
            title: "4 Harfli Wordle Oyna - Kısa Kelime Bulmacası | WordShift",
            description: "4 harfli wordle kelime oyunu! Kısa kelimeler, hızlı oyun. Her gün yeni 4 harfli günlük bulmaca. WordShift'te ücretsiz oyna!"
        },
        en: {
            title: "4 Letter Word Game - Short Word Puzzle | WordShift",
            description: "4 letter word puzzle game! Short words, fast gameplay. New 4 letter puzzle daily. Play free on WordShift!"
        }
    },
    play5: {
        tr: {
            title: "5 Harfli Wordle Oyna - Klasik Kelime Bulmacası | WordShift",
            description: "Klasik 5 harfli wordle kelime oyunu! En popüler günlük kelime bulmacası. Her gün yeni kelime. WordShift ile oyna!"
        },
        en: {
            title: "5 Letter Word Game - Classic Daily Puzzle | WordShift",
            description: "Classic 5 letter word puzzle! Most popular daily word game. New word every day. Play on WordShift!"
        }
    },
    play6: {
        tr: {
            title: "6 Harfli Wordle Oyna - Zorlu Kelime Bulmacası | WordShift",
            description: "6 harfli zorlu wordle kelime oyunu! Daha uzun kelimeler, daha zor bulmaca. Her gün yeni meydan okuma!"
        },
        en: {
            title: "6 Letter Word Game - Hard Word Puzzle | WordShift",
            description: "6 letter challenging word puzzle! Longer words, harder game. New challenge every day!"
        }
    },
    play7: {
        tr: {
            title: "7 Harfli Wordle Oyna - En Zorlu Kelime Bulmacası | WordShift",
            description: "7 harfli en zorlu wordle kelime oyunu! Kelime ustası mısın? Her gün yeni zorlu bulmaca!"
        },
        en: {
            title: "7 Letter Word Game - Expert Word Puzzle | WordShift",
            description: "7 letter hardest word puzzle! Are you a word master? New tough challenge daily!"
        }
    },
    practice: {
        tr: {
            title: "Sınırsız Wordle Oyna - Pratik Kelime Oyunu | WordShift",
            description: "Sınırsız wordle kelime oyunu! Günlük limite takılmadan istediğin kadar pratik yap. WordShift'te ücretsiz!"
        },
        en: {
            title: "Unlimited Word Game - Practice Mode | WordShift",
            description: "Unlimited word puzzle practice! No daily limits, play as much as you want. Free on WordShift!"
        }
    },
    multiplayer: {
        tr: {
            title: "Çok Oyunculu Kelime Yarışması - Arkadaşla Wordle Oyna | WordShift",
            description: "Arkadaşla kelime yarışması oyna! Çok oyunculu wordle alternatifi. Gerçek rakiplerle canlı rekabetçi kelime oyunu, ELO sıralaması. Ücretsiz!"
        },
        en: {
            title: "Multiplayer Wordle Alternative - Battle Friends Live | WordShift",
            description: "Best multiplayer wordle alternative! Play word puzzle with friends real-time. Competitive word game with ELO ranking. Free to play!"
        }
    },
    leaderboard: {
        tr: {
            title: "Kelime Oyunu Sıralaması - En İyi Oyuncular | WordShift",
            description: "WordShift kelime oyunu sıralaması! En iyi oyuncular, ELO puanları, kazanma oranları. Sıralamadaki yerini gör!"
        },
        en: {
            title: "Word Game Leaderboard - Top Players | WordShift",
            description: "WordShift word game leaderboard! Top players, ELO scores, win rates. See your ranking!"
        }
    },
    shop: {
        tr: {
            title: "Oyun Mağazası - İpucu ve Güçlendiriciler | WordShift",
            description: "WordShift mağazası! İpucu ve eleme güçlendiricileri, avatarlar ve özel eşyalar."
        },
        en: {
            title: "Game Shop - Hints & Powerups | WordShift",
            description: "WordShift shop! Hint and eliminate powerups, avatars and special items."
        }
    },
    howToPlay: {
        tr: {
            title: "Wordle Nasıl Oynanır - Kelime Oyunu Kuralları | WordShift",
            description: "Wordle kelime oyunu nasıl oynanır? Detaylı oyun kuralları, ipuçları ve kazanma stratejileri. Başlangıç rehberi!"
        },
        en: {
            title: "How to Play Word Game - Rules & Tips | WordShift",
            description: "How to play word puzzle game? Detailed rules, tips and winning strategies. Beginner's guide!"
        }
    }
};

// FAQ Schema for rich snippets
export const FAQ_SCHEMA = {
    tr: [
        {
            question: "WordShift nedir?",
            answer: "WordShift, ücretsiz bir online kelime tahmin oyunudur. Her gün yeni bir kelime bulmacası çözebilir, sınırsız modda pratik yapabilir veya multiplayer modda rakiplerle yarışabilirsiniz."
        },
        {
            question: "Wordle nasıl oynanır?",
            answer: "6 deneme hakkınız var. Her tahminden sonra harfler renklenir: Yeşil = doğru yerde, Sarı = kelimede var ama yanlış yerde, Gri = kelimede yok. Doğru kelimeyi bulmaya çalışın!"
        },
        {
            question: "Günlük kelime ne zaman yenilenir?",
            answer: "Günlük kelime her gün gece yarısı (00:00) yenilenir. Her gün 4, 5, 6 ve 7 harfli olmak üzere 4 farklı günlük bulmaca çözebilirsiniz."
        },
        {
            question: "Multiplayer mod nasıl çalışır?",
            answer: "Multiplayer modda gerçek rakiplerle eşleşir ve aynı kelimeyi aynı anda çözmeye çalışırsınız. Daha hızlı ve az tahminle çözen kazanır. ELO puanı kazanıp sıralamada yükselirsiniz."
        },
        {
            question: "WordShift ücretsiz mi?",
            answer: "Evet! WordShift tamamen ücretsizdir. Günlük modlar, sınırsız pratik ve multiplayer özelliklerinin tamamına ücretsiz erişebilirsiniz."
        }
    ],
    en: [
        {
            question: "What is WordShift?",
            answer: "WordShift is a free online word guessing game. Solve a new daily puzzle every day, practice unlimited, or battle opponents in multiplayer mode."
        },
        {
            question: "How do you play Wordle?",
            answer: "You have 6 attempts. After each guess, letters are colored: Green = correct position, Yellow = in word but wrong position, Gray = not in word. Try to find the word!"
        },
        {
            question: "When does the daily word reset?",
            answer: "Daily words reset at midnight (00:00). Each day you can solve 4 different puzzles: 4, 5, 6, and 7 letter modes."
        },
        {
            question: "How does multiplayer work?",
            answer: "In multiplayer mode, you're matched with real opponents and solve the same word simultaneously. Faster solver with fewer guesses wins. Earn ELO points and climb the rankings!"
        },
        {
            question: "Is WordShift free?",
            answer: "Yes! WordShift is completely free. You can access all daily modes, unlimited practice, and multiplayer features for free."
        }
    ]
};

// Helper to get localized metadata
export function getLocalizedMeta(pageKey: keyof typeof PAGE_METADATA, lang: "tr" | "en" = "tr") {
    const page = PAGE_METADATA[pageKey];
    return page?.[lang] || page?.tr || { title: SEO_CONFIG.defaultTitle[lang], description: SEO_CONFIG.defaultDescription[lang] };
}

// Generate Open Graph metadata
export function generateOGMeta(title: string, description: string, path: string = "/", image?: string) {
    return {
        title,
        description,
        url: `${SITE_URL}${path}`,
        siteName: SITE_NAME,
        images: [
            {
                url: image || `${SITE_URL}/og-image.png`,
                width: 1200,
                height: 630,
                alt: title,
            }
        ],
        locale: "tr_TR",
        alternateLocale: "en_US",
        type: "website" as const,
    };
}

// Generate Twitter metadata
export function generateTwitterMeta(title: string, description: string, image?: string) {
    return {
        card: "summary_large_image" as const,
        title,
        description,
        images: [image || `${SITE_URL}/og-image.png`],
        creator: SEO_CONFIG.twitterHandle,
    };
}

// Generate FAQ Schema JSON-LD
export function generateFAQSchema(lang: "tr" | "en" = "tr") {
    const faqs = FAQ_SCHEMA[lang];
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(faq => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer
            }
        }))
    };
}

// Generate BreadcrumbList Schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: `${SITE_URL}${item.url}`
        }))
    };
}
