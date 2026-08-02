import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/my-bookings", "/api/"],
    },
    sitemap: "https://apex-racing-simulator.vercel.app/sitemap.xml",
  };
}
