/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		ignoreBuildErrors: false, // ✅ Fail on type errors (security best practice)
	},
	images: {
		// Configure remote image sources with strict patterns
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**.convex.cloud',
				port: '',
				pathname: '/**',
				search: '',
			},
			{
				protocol: 'https',
				hostname: 'img.clerk.com',
				port: '',
				pathname: '/**',
				search: '',
			},
			{
				protocol: 'https',
				hostname: 'images.clerk.dev',
				port: '',
				pathname: '/**',
				search: '',
			},
		],

		// Enable modern formats (WebP + AVIF)
		formats: ['image/avif', 'image/webp'],

		// Optimize device sizes for LMS platform
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

		// Cache optimized images for 1 year
		minimumCacheTTL: 31536000,

		// Security: Disable SVG to prevent XSS
		dangerouslyAllowSVG: false,
	},

	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{
						key: 'X-DNS-Prefetch-Control',
						value: 'on',
					},
					{
						key: 'Strict-Transport-Security',
						value: 'max-age=63072000; includeSubDomains; preload',
					},
					{
						key: 'X-Frame-Options',
						value: 'SAMEORIGIN',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'X-XSS-Protection',
						value: '1; mode=block',
					},
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
					{
						key: 'Permissions-Policy',
						value: 'camera=(), microphone=(), geolocation=()',
					},
					{
						key: 'Content-Security-Policy',
						value: [
							"default-src 'self'",
							"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://challenges.cloudflare.com *.convex.cloud",
							"style-src 'self' 'unsafe-inline'",
							"img-src 'self' data: blob: https://img.clerk.com https://images.clerk.dev *.convex.cloud",
							"font-src 'self' data:",
							"connect-src 'self' https://*.clerk.accounts.dev https://clerk-telemetry.com *.convex.cloud wss://*.convex.cloud",
							"frame-src 'self' https://challenges.cloudflare.com",
							"worker-src 'self' blob:",
						].join('; '),
					},
				],
			},
		];
	},
};

export default nextConfig;
