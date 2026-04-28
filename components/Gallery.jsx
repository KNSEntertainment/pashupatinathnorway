import { getLocale } from "next-intl/server";

export default async function Gallery() {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
	const locale = await getLocale();

	const res = await fetch(`${baseUrl}/api/gallery`, { cache: "no-store" });
	const data = await res.json();
	const gallery = data.gallery || [];

	// Use locale-specific alt text
	const images = gallery.flatMap((item) => {
		const altText = item[`alt_${locale}`] || item.alt_en || item.alt || "Gallery image";
		return (item.media || []).map((src) => ({ src, alt: altText }));
	});

	// Import GalleryWrapper as a client component
	const GalleryWrapper = (await import("./GalleryWrapper")).default;
	return <GalleryWrapper images={images} locale={locale} />;
}
