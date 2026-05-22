import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig = withNextIntl({
	// Package optimization
	experimental: {
		optimizePackageImports: [
			'lucide-react',
			'@radix-ui/react-avatar',
			'@radix-ui/react-dialog',
			'@radix-ui/react-label',
			'@radix-ui/react-select',
			'@radix-ui/react-separator',
			'@radix-ui/react-slider',
			'@radix-ui/react-slot',
			'@radix-ui/react-tabs',
			'@radix-ui/react-toast',
			'@radix-ui/react-alert-dialog',
			'@radix-ui/react-checkbox'
		]
	},
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
				hostname: "images.unsplash.com",
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
				hostname: "unsplash.com",
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
	

	
	// Compression and caching
	compress: true,
	poweredByHeader: false,
	
	// Compiler optimizations
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},
	
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
	
	// Bundle optimization - simplified for dev mode
	webpack: (config, { dev, isServer }) => {
		// Only apply optimizations in production
		if (!dev && !isServer) {
			config.optimization.splitChunks = {
				chunks: 'all',
				cacheGroups: {
					react: {
						test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
						name: 'react',
						priority: 30,
						chunks: 'all',
					},
					next: {
						test: /[\\/]node_modules[\\/](next|next-intl)[\\/]/,
						name: 'next',
						priority: 25,
						chunks: 'all',
					},
					heavy: {
						test: /[\\/]node_modules[\\/](recharts|@dnd-kit|stripe|twilio|resend|mongoose|next-auth|jose|bcrypt|cloudinary|qrcode|yet-another-react-lightbox)[\\/]/,
						name: 'heavy',
						priority: 20,
						chunks: 'async',
					},
				},
			};
		}
		
		return config;
	},
	
	});

export default nextConfig;
