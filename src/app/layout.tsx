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

// ─── SEO Metadata ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  // Primary
  title: "Nilesh Kishore | MLOps Engineer · ML Engineer · Data Engineer",
  description:
    "Nilesh Kishore is an MLOps and Data Engineer specialising in scalable ML pipelines, LLM integration, OCR systems, Databricks, Apache Spark, MLflow, and cloud-native AI infrastructure on AWS and Azure.",

  // Keywords (used by some crawlers and all search indexers)
  keywords: [
    "Nilesh Kishore",
    "MLOps Engineer",
    "Machine Learning Engineer",
    "Data Engineer",
    "LLM Engineer",
    "AI Engineer",
    "DataOps Engineer",
    "MLflow",
    "Databricks",
    "Apache Spark",
    "PySpark",
    "OCR Pipeline",
    "Computer Vision",
    "NLP Engineer",
    "Transformer Models",
    "FastAPI",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure ML",
    "CI/CD ML",
    "Fraud Detection ML",
    "ETL Pipeline",
    "Unity Catalog",
    "Sigmoid",
    "Bihar Engineering University",
  ],

  // Canonical URL — replace with your actual domain
  metadataBase: new URL("https://nileshkishore.dev"),
  alternates: {
    canonical: "/",
  },

  // Author
  authors: [{ name: "Nilesh Kishore", url: "https://nileshkishore.dev" }],
  creator: "Nilesh Kishore",

  // Open Graph (LinkedIn, Facebook, WhatsApp previews)
  openGraph: {
    type: "website",
    url: "https://nileshkishore.dev",
    title: "Nilesh Kishore | MLOps · ML · Data Engineer",
    description:
      "Portfolio of Nilesh Kishore — building scalable ML systems, LLM pipelines, OCR engines, and enterprise MLOps infrastructure on Databricks, AWS, and Azure.",
    siteName: "Nilesh Kishore Portfolio",
    images: [
      {
        url: "/images/og-image.png", // create a 1200×630 preview image
        width: 1200,
        height: 630,
        alt: "Nilesh Kishore — MLOps & ML Engineer Portfolio",
      },
    ],
    locale: "en_IN",
  },

  // Twitter / X card
  twitter: {
    card: "summary_large_image",
    title: "Nilesh Kishore | MLOps · ML · Data Engineer",
    description:
      "Scalable ML pipelines, LLM systems, OCR, Databricks, Spark, MLflow — portfolio of Nilesh Kishore.",
    images: ["/images/og-image.png"],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  // Verification tokens — fill in after adding your site to each console
  verification: {
    google: "REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_TOKEN",
    // bing: "REPLACE_WITH_BING_WEBMASTER_TOKEN",
  },

  // Misc
  category: "technology",
};

// ─── Structured Data (JSON-LD) ────────────────────────────────────────────────
// Tells Google exactly who this page is about — eligible for rich results.

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Nilesh Kishore",
  url: "https://nileshkishore.dev",
  image: "https://nileshkishore.dev/images/nilesh_pic.png",
  email: "mailto:nileshkishore2001@gmail.com",
  telephone: "+91-7488602895",
  jobTitle: "Associate DataOps Engineer",
  description:
    "MLOps Engineer and Data Engineer specialising in ML pipelines, LLM systems, OCR, Databricks, Spark, MLflow, FastAPI, Docker, AWS, and Azure ML.",
  sameAs: [
    "https://github.com/Nileshkishore",
    "https://www.linkedin.com/in/nilesh-kishore-1b70381b2",
  ],
  alumniOf: {
    "@type": "EducationalOrganization",
    name: "Bihar Engineering University, Patna",
  },
  worksFor: {
    "@type": "Organization",
    name: "Sigmoid",
  },
  knowsAbout: [
    "MLOps",
    "Machine Learning",
    "Data Engineering",
    "LLM",
    "Large Language Models",
    "OCR",
    "Computer Vision",
    "NLP",
    "Databricks",
    "Apache Spark",
    "MLflow",
    "FastAPI",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure ML",
    "PyTorch",
    "TensorFlow",
    "PySpark",
    "ETL Pipelines",
  ],
};

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Preconnect to Google Fonts CDN for faster load */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Favicons — drop these files in /public */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Theme colour for browser chrome (matches fuchsia default theme) */}
        <meta name="theme-color" content="#030014" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}