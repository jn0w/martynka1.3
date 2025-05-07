/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add configuration to help with caching issues on Vercel
  headers: async () => {
    return [
      {
        // Apply to the admin panel routes
        source: "/adminPanel",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
