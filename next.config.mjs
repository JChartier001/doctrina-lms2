/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		ignoreBuildErrors: false, // ✅ Fail on type errors (security best practice)
	},
	images: {
		unoptimized: true,
	},
};

export default nextConfig;
