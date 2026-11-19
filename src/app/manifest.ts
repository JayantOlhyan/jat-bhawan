import type { MetadataRoute } from "next";

/** Web app manifest: "Add to Home screen" name, colours and icons. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "जाट भवन, नजफगढ़ | Jat Bhawan, Najafgarh",
    short_name: "जाट भवन",
    description: "Jat Bhawan, Najafgarh: donations, donor wall, committee and hall booking.",
    start_url: "/hi",
    display: "standalone",
    background_color: "#F7F1E6",
    theme_color: "#7A1F1F",
    lang: "hi",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
