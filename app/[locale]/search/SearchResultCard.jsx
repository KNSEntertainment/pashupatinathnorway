"use client";
import { Calendar, BookOpen, Image as ImageIcon, FileText, Download as DownloadIcon, Video as VideoIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

function highlight(text, query) {
	if (!text || !query) return text;
	const regex = new RegExp(`(${query})`, "gi");
	return text.split(regex).map((part, i) =>
		part.toLowerCase() === query.toLowerCase() ? (
			<mark key={i} className="bg-yellow-200 px-1 rounded">
				{part}
			</mark>
		) : (
			part
		),
	);
}

function isValidImageUrl(url) {
	if (typeof url !== "string") return false;
	const trimmed = url.trim();
	if (!trimmed) return false;
	if (/^(https?:\/\/|\/)[^\s]*$/.test(trimmed)) return true;
	return false;
}

export default function SearchResultCard({ item, query }) {
	const t = useTranslations("search");
	const typeIcon = {
		Event: <Calendar className="w-5 h-5 text-success0" />,
		Gallery: <ImageIcon className="w-5 h-5 text-pink-500" />,
		Notice: <BookOpen className="w-5 h-5 text-orange-500" />,
		Blog: <BookOpen className="w-5 h-5 text-blue-500" />,
		Circular: <FileText className="w-5 h-5 text-purple-500" />,
		Download: <DownloadIcon className="w-5 h-5 text-teal-500" />,
		Video: <VideoIcon className="w-5 h-5 text-red-500" />,
		Page: <BookOpen className="w-5 h-5 text-cyan-500" />,
	}[item.type];

	const CardContent = (
		<div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col h-full">
			<div className="flex items-center gap-2 px-4 pt-4">
				{typeIcon}
				<span className="text-xs font-semibold uppercase tracking-wide text-gray-900">{item.type}</span>
			</div>
			{isValidImageUrl(item.image) && (
				<div className="relative h-72 w-full mt-2">
					<Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover object-top" />
				</div>
			)}
			<div className="p-4 flex-1 flex flex-col">
				<h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{highlight(item.title, query)}</h3>
				{item.description && <p className="text-gray-900 text-sm line-clamp-3 mb-2">{highlight(item.description.replace(/<[^>]*>/g, ""), query)}</p>}
				{item.url && <span className="mt-2 inline-block text-brand border w-fit py-2 px-4 rounded-lg border-1 border-brand font-semibold text-sm hover:underline">{t("viewDetails")}</span>}
			</div>
		</div>
	);

	return item.url ? (
		<Link href={item.url} className="h-full block focus:outline-brand">
			{CardContent}
		</Link>
	) : (
		<div className="h-full block cursor-default opacity-80">{CardContent}</div>
	);
}
