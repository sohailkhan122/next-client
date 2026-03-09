// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

import type { NextConfig } from "next";
const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                // Proxy all /proxy/* requests to the real backend
                // This ensures cookies are set on the frontend domain, not the backend domain
                source: "/proxy/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
