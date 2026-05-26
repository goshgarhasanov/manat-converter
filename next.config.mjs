/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

// GitHub Pages-də layihə alt-yolda (/manat-converter) yerləşir.
// Lokal `next dev`-də basePath boş qalır ki, http://localhost:3000 işləsin.
const repo = "manat-converter";

const nextConfig = {
  output: "export", // statik export → GitHub Pages
  basePath: isProd ? `/${repo}` : "",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
