const config = {
  siteUrl: process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  sitemapSize: 7000,
  changefreq: "weekly",
  priority: 0.7,
  exclude: ["/admin", "/admin/*", "/api/*", "/dashboard/*", "/_next/*", "/fonts/*"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/dashboard"],
      },
    ],
  },
};
export default config;
