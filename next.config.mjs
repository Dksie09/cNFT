/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            os: false,
            path: false,
        };
        return config;
    },
};

export default nextConfig;