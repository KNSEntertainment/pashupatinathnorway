import { Search } from "lucide-react";
import SearchResultsClient from "./SearchResultsClient";
import SearchBar from "./SearchBar";
import { getTranslations } from "next-intl/server";

async function SearchContent({ query, locale }) {
	const t = await getTranslations("search");

	// Fetch data using direct DB functions
	const { getEvents } = await import("@/lib/data/events");
	const { getGallery } = await import("@/lib/data/gallery");
	const { getNotices } = await import("@/lib/data/notices");
	const { getExecutiveMembers } = await import("@/lib/data/executive-members");
	const { getBlogs } = await import("@/lib/data/blogs");
	const { getCirculars } = await import("@/lib/data/circulars");
	const { getDownloads } = await import("@/lib/data/downloads");
	const connectDB = (await import("@/lib/mongodb")).default;
	const Video = (await import("@/models/Video.Model")).default;
	const Membership = (await import("@/models/Membership.Model")).default;

	// Fetch videos manually
	await connectDB();
	const videosArray = await Video.find({ isActive: true }).lean();
	
	// Fetch membership data
	const membershipArray = await Membership.find({ membershipStatus: "approved" }).lean();

	const [eventsArray, galleryArray, noticesArray, membersArray, blogsArray, circularsArray, downloadsArray] = await Promise.all([getEvents(), getGallery(), getNotices(), getExecutiveMembers(), getBlogs(), getCirculars(), getDownloads()]);
	const lowerQuery = query.toLowerCase().trim();

	const filteredEvents = eventsArray.filter((event) => {
		const titleMatch = event.eventname?.toLowerCase().trim().includes(lowerQuery);
		const descMatch = event.eventdescription?.toLowerCase().trim().includes(lowerQuery);
		const locMatch = event.eventvenue?.toLowerCase().trim().includes(lowerQuery);
		return titleMatch || descMatch || locMatch;
	});

	const filteredGallery = galleryArray.filter((item) => {
		const titleMatch = item.title?.toLowerCase().trim().includes(lowerQuery);
		const descMatch = item.description?.toLowerCase().trim().includes(lowerQuery);
		const catMatch = item.category?.toLowerCase().trim().includes(lowerQuery);
		return titleMatch || descMatch || catMatch;
	});

	const filteredNotices = noticesArray.filter((notice) => {
		const titleMatch = notice.noticetitle?.toLowerCase().trim().includes(lowerQuery);
		const contentMatch = notice.notice?.toLowerCase().trim().includes(lowerQuery);
		return titleMatch || contentMatch;
	});
	const filteredMembers = membersArray.filter((member) => {
		const nameMatch = member.name?.toLowerCase().trim().includes(lowerQuery);
		const positionMatch = member.position?.toLowerCase().trim().includes(lowerQuery);
		const departmentMatch = member.department?.toLowerCase().trim().includes(lowerQuery);
		const emailMatch = member.email?.toLowerCase().trim().includes(lowerQuery);
		return nameMatch || positionMatch || departmentMatch || emailMatch;
	});

	// Filter membership data (regular members)
	const filteredMembership = membershipArray.filter((member) => {
		const nameMatch = member.fullName?.toLowerCase().trim().includes(lowerQuery);
		const emailMatch = member.email?.toLowerCase().trim().includes(lowerQuery);
		const phoneMatch = member.phone?.toLowerCase().trim().includes(lowerQuery);
		const skillsMatch = member.skills?.toLowerCase().trim().includes(lowerQuery);
		const membershipTypeMatch = member.membershipType?.toLowerCase().trim().includes(lowerQuery);
		const volunteerMatch = member.volunteerInterest?.some((interest) => interest?.toLowerCase().trim().includes(lowerQuery));
		return nameMatch || emailMatch || phoneMatch || skillsMatch || membershipTypeMatch || volunteerMatch;
	});
	const filteredBlogs = blogsArray.filter((blog) => {
		const titleMatch = blog.blogTitle?.toLowerCase().trim().includes(lowerQuery);
		const contentMatch = blog.blogDesc?.toLowerCase().trim().includes(lowerQuery);
		const authorMatch = blog.blogAuthor?.toLowerCase().trim().includes(lowerQuery);
		return titleMatch || contentMatch || authorMatch;
	});

	const filteredCirculars = circularsArray.filter((circular) => {
		if (circular.publicationStatus !== "published") return false;
		const titleMatch = Object.values(circular.circularTitle || {}).some((title) => title?.toLowerCase().trim().includes(lowerQuery));
		const descMatch = Object.values(circular.circularDesc || {}).some((desc) => desc?.toLowerCase().trim().includes(lowerQuery));
		const authorMatch = Object.values(circular.circularAuthor || {}).some((author) => author?.toLowerCase().trim().includes(lowerQuery));
		return titleMatch || descMatch || authorMatch;
	});

	const filteredDownloads = downloadsArray.filter((download) => {
		const titleMatch = download.title?.toLowerCase().trim().includes(lowerQuery);
		const categoryMatch = download.category?.toLowerCase().trim().includes(lowerQuery);
		return titleMatch || categoryMatch;
	});

	const filteredVideos = videosArray.filter((video) => {
		const titleMatch = video.title?.toLowerCase().trim().includes(lowerQuery);
		const descMatch = video.description?.toLowerCase().trim().includes(lowerQuery);
		const categoryMatch = video.category?.toLowerCase().trim().includes(lowerQuery);
		const creatorMatch = video.creator?.toLowerCase().trim().includes(lowerQuery);
		return titleMatch || descMatch || categoryMatch || creatorMatch;
	});

	const staticPages = [
		{ title: "About Us", href: "/about-us", keywords: ["about", "school", "history", "mission", "vision", "values"] },
		{ title: "Our Team", href: "/team", keywords: ["team", "staff", "member"] },
		{ title: "Contact Us", href: "/contact", keywords: ["contact", "reach", "email", "phone", "address", "location"] },
		{ title: "Gallery", href: "/gallery", keywords: ["gallery", "photos", "images", "pictures"] },
	];

	const matchedPages = staticPages.filter((page) => {
		const titleMatch = page.title.toLowerCase().includes(lowerQuery);
		const keywordMatch = page.keywords.some((keyword) => lowerQuery.includes(keyword) || keyword.includes(lowerQuery));
		return titleMatch || keywordMatch;
	});

	const allResults = [
		...filteredEvents.map((item) => ({
			type: "Event",
			_id: String(item._id),
			title: item.eventname,
			description: item.eventdescription,
			image: item.eventposterUrl,
			url: `/en/notices/${item._id}`,
			date: item.eventdate ? String(item.eventdate) : null,
			meta: item.eventvenue,
		})),
		...filteredGallery.map((item) => ({
			type: "Gallery",
			_id: String(item._id),
			title: item.title,
			description: item.description,
			image: item.imageUrl || item.media,
			url: `/en/gallery`,
			date: item.date ? String(item.date) : null,
			meta: item.category,
		})),
		...filteredNotices.map((item) => ({
			type: "Notice",
			_id: String(item._id),
			title: item.noticetitle,
			description: item.notice,
			image: item.noticeimage,
			url: `/en/notices/${item._id}`,
			date: item.noticedate ? String(item.noticedate) : null,
			meta: item.classGroup,
		})),
		...filteredMembers.map((item) => ({
			type: "Member",
			_id: String(item._id),
			title: item.name,
			description: item.position || "Executive Member",
			image: item.imageUrl,
			url: `/en/members/${item._id}`,
			date: item.createdAt ? String(item.createdAt) : null,
			meta: "View Details",
		})),
		...filteredMembership.map((item) => ({
			type: "Member",
			_id: String(item._id),
			title: item.fullName,
			description: item.skills || "Member",
			image: item.profilePhoto,
			url: `/en/members/${item._id}`,
			date: item.createdAt ? String(item.createdAt) : null,
			meta: "View Details",
		})),
		...filteredBlogs.map((item) => ({
			type: "Blog",
			_id: String(item._id),
			title: item.blogTitle,
			description: item.blogDesc,
			image: item.blogMainPicture,
			url: `/en/blogs/${item._id}`,
			date: item.blogDate ? String(item.blogDate) : null,
			meta: item.blogAuthor,
		})),
		...filteredCirculars.map((item) => ({
			type: "Circular",
			_id: String(item._id),
			title: item.circularTitle?.[locale] || item.circularTitle?.en || item.circularTitle?.no || "Circular",
			description: item.circularDesc?.[locale] || item.circularDesc?.en || item.circularDesc?.no || "",
			image: item.circularMainPicture,
			url: `/updates`,
			date: item.circularPublishedAt ? String(item.circularPublishedAt) : item.createdAt ? String(item.createdAt) : null,
			meta: item.circularAuthor?.[locale] || item.circularAuthor?.en || null,
		})),
		...filteredDownloads.map((item) => ({
			type: "Download",
			_id: String(item.id),
			title: item.title,
			description: `${item.category} - Downloaded ${item.downloadCount || 0} times`,
			image: item.imageUrl,
			url: `/downloads`,
			date: item.date ? String(item.date) : null,
			meta: item.category,
		})),
		...filteredVideos.map((item) => ({
			type: "Video",
			_id: String(item._id),
			title: item.title,
			description: item.description || `${item.category} video`,
			image: item.thumbnail,
			url: `/video-gallery`,
			date: item.createdAt ? String(item.createdAt) : null,
			meta: `${item.category}${item.duration ? ` • ${item.duration}` : ""}`,
		})),
		...matchedPages.map((item) => ({
			type: "Page",
			_id: item.href,
			title: item.title,
			description: "Static page",
			image: null,
			url: item.href,
			date: null,
			meta: null,
		})),
	];
	const totalResults = allResults.length;

	return (
		<div className="mx-6 md:mx-12 pt-12 max-w-6xl">
			<div className="mx-auto">
				{/* Search Bar - Always visible */}
				<SearchBar initialQuery={query} />
			</div>
			{/* Search Header */}
			{totalResults !== 0 && (
				<div className="mb-8">
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t("resultsTitle")}</h1>
					<p className="text-gray-900 text-lg">{t("resultsFound", { count: totalResults, query })}</p>
				</div>
			)}

			{totalResults === 0 ? (
				<div className="text-center py-20">
					<Search className="mx-auto h-16 w-16 text-gray-900 mb-4" />
					<h2 className="text-2xl font-semibold text-gray-900 mb-2">{t("noResults")}</h2>
					<p className="text-gray-900">{t("tryDifferentKeywords")}</p>
				</div>
			) : (
				<SearchResultsClient results={allResults} query={query} />
			)}
		</div>
	);
}

export default async function SearchPage({ searchParams, params }) {
	const resolvedParams = typeof params.then === "function" ? await params : params;
	const resolvedSearchParams = typeof searchParams.then === "function" ? await searchParams : searchParams;
	const locale = resolvedParams.locale || "en";
	const query = resolvedSearchParams.q || "";
	if (!query) {
		return (
			<div className="min-h-screen bg-light py-12">
				<div className="container mx-auto px-4">
					<div className="text-center">No search query provided.</div>
				</div>
			</div>
		);
	}
	return <>{await SearchContent({ query, locale })}</>;
}
