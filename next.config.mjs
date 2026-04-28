import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig = withNextIntl({
	// Image optimization
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "plus.unsplash.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "img.youtube.com",
				port: "",
				pathname: "/**",
			},
		],
		formats: ['image/webp', 'image/avif'],
		minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	
	// Performance optimizations
	experimental: {
		turbo: {
			resolveAlias: {
				// Reduce bundle size by aliasing to smaller packages
				'framer-motion': 'framer-motion/dist/framer-motion.min.js',
			},
		},
	},
	
	// Compression and caching
	compress: true,
	poweredByHeader: false,
	
	// Security headers
	async headers() {
		return [
			{
				source: '/api/:path*',
				headers: [
					{ key: 'Access-Control-Allow-Credentials', value: 'true' },
					{ key: 'Access-Control-Allow-Origin', value: '*' },
					{ key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
					{ key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
				],
			},
			{
				source: '/_next/static/(.*)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
			{
				source: '/images/(.*)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
		];
	},
	
	// Bundle optimization
	webpack: (config, { dev, isServer }) => {
		// Optimize bundle size
		if (!dev && !isServer) {
			config.optimization.splitChunks = {
				chunks: 'all',
				cacheGroups: {
					default: {
						minChunks: 2,
						priority: -20,
						reuseExistingChunk: true,
					},
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendors',
						priority: -10,
						chunks: 'all',
					},
					react: {
						test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
						name: 'react',
						priority: 20,
						chunks: 'all',
					},
					framer: {
						test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
						name: 'framer',
						priority: 15,
						chunks: 'all',
					},
				},
			};
		}
		
		// Reduce bundle size by excluding unnecessary modules
		config.externals = config.externals || [];
		if (!isServer) {
			config.externals.push({
				'canvas': '{}',
				'jsdom': '{}',
			});
		}
		
		return config;
	},
	
	});

export default nextConfig;
