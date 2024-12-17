/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';
const CDN_DOMAIN = 'https://charts.cx';

const ContentSecurityPolicyDev = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' ${CDN_DOMAIN};
    worker-src 'self' blob:;
    style-src 'self' 'unsafe-inline' ${CDN_DOMAIN};
    img-src 'self' blob: data: ${CDN_DOMAIN};
    connect-src 'self' ws: ${CDN_DOMAIN};
    font-src 'self' ${CDN_DOMAIN};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
`;

const ContentSecurityPolicyProd = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' ${CDN_DOMAIN};
    worker-src 'self' blob:;
    style-src 'self' 'unsafe-inline' ${CDN_DOMAIN};
    img-src 'self' blob: data: ${CDN_DOMAIN} lh3.googleusercontent.com;
    connect-src 'self' ${CDN_DOMAIN};
    font-src 'self' ${CDN_DOMAIN};
    object-src 'self';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    report-uri /api/csp-report;
`;

const ContentSecurityPolicy = isDev ? ContentSecurityPolicyDev : ContentSecurityPolicyProd;

const nextConfig = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: ContentSecurityPolicy.replace(/\n/g, ' ').trim(),
                    }
                ],
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
