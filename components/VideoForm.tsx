"use client";
import React, { useState } from "react";
import { Upload, Video as VideoIcon, Link as LinkIcon } from "lucide-react";
import Image from "next/image";

interface Video {
	_id?: string;
	title_en: string;
	title_ne?: string;
	title_no?: string;
	category: string;
	duration?: string;
	description_en: string;
	description_ne?: string;
	description_no?: string;
	creator_en: string;
	creator_ne?: string;
	url?: string;
	thumbnail?: string;
	isYouTube?: boolean;
}

interface VideoFormProps {
	videoToEdit?: Video;
	onClose: () => void;
}

export default function VideoForm({ videoToEdit, onClose }: VideoFormProps) {
	const [formData, setFormData] = useState({
		title_en: videoToEdit?.title_en || "",
		title_ne: videoToEdit?.title_ne || "",
		title_no: videoToEdit?.title_no || "",
		category: videoToEdit?.category || "",
		duration: videoToEdit?.duration || "",
		description_en: videoToEdit?.description_en || "",
		description_ne: videoToEdit?.description_ne || "",
		description_no: videoToEdit?.description_no || "",
		creator_en: videoToEdit?.creator_en || "PNSB-Norway",
		creator_ne: videoToEdit?.creator_ne || "आरएसपी नर्वे",
		youtubeUrl: videoToEdit?.isYouTube ? videoToEdit?.url : "",
	});
	const [videoFile, setVideoFile] = useState<File | null>(null);
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [videoPreview, setVideoPreview] = useState(videoToEdit?.url || "");
	const [thumbnailPreview, setThumbnailPreview] = useState(videoToEdit?.thumbnail || "");
	const [uploadType, setUploadType] = useState<"file" | "youtube">(videoToEdit?.isYouTube ? "youtube" : "file");

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });

		// Update YouTube preview when URL changes
		if (name === "youtubeUrl" && value) {
			const videoId = extractYouTubeId(value);
			if (videoId) {
				setVideoPreview(`https://www.youtube.com/embed/${videoId}`);
			}
		}
	};

	const extractYouTubeId = (url: string): string | null => {
		const patterns = [
			/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
			/^([a-zA-Z0-9_-]{11})$/, // Direct video ID
		];

		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match) return match[1];
		}
		return null;
	};

	const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setVideoFile(file);
			const url = URL.createObjectURL(file);
			setVideoPreview(url);
			setFormData({ ...formData, youtubeUrl: "" }); // Clear YouTube URL if file is selected
		}
	};

	const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setThumbnailFile(file);
			const url = URL.createObjectURL(file);
			setThumbnailPreview(url);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const data = new FormData();
			data.append("title_en", formData.title_en);
			data.append("title_ne", formData.title_ne);
			data.append("title_no", formData.title_no);
			data.append("category", formData.category);
			data.append("duration", formData.duration);
			data.append("description_en", formData.description_en);
			data.append("description_ne", formData.description_ne);
			data.append("description_no", formData.description_no);
			data.append("creator_en", formData.creator_en);
			data.append("creator_ne", formData.creator_ne);

			if (uploadType === "youtube" && formData.youtubeUrl) {
				const videoId = extractYouTubeId(formData.youtubeUrl);
				if (!videoId) {
					throw new Error("Invalid YouTube URL");
				}
				data.append("youtubeUrl", formData.youtubeUrl);
				data.append("isYouTube", "true");
			} else if (videoFile) {
				data.append("video", videoFile);
				data.append("isYouTube", "false");
			}

			if (thumbnailFile) {
				data.append("thumbnail", thumbnailFile);
			}

			const url = videoToEdit ? `/api/videos/${videoToEdit._id}` : "/api/videos/create";
			const method = videoToEdit ? "PUT" : "POST";

			const res = await fetch(url, {
				method,
				body: data,
			});

			const result = await res.json();

			if (!result.success) {
				throw new Error(result.error || "Failed to save video");
			}

			alert(videoToEdit ? "Video updated successfully!" : "Video uploaded successfully!");
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && <div className="mb-4 p-3 bg-red-50 border border-red-600 text-red-600 rounded">{error}</div>}

			{/* Upload Type Toggle */}
			<div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
				<button
					type="button"
					onClick={() => {
						setUploadType("file");
						setFormData({ ...formData, youtubeUrl: "" });
						setVideoPreview(videoToEdit?.url && !videoToEdit?.isYouTube ? videoToEdit.url : "");
					}}
					className={`flex-1 py-2 px-4 rounded-md font-medium transition ${uploadType === "file" ? "bg-white text-brand shadow" : "text-gray-600 hover:text-gray-900"}`}
				>
					<VideoIcon size={20} className="inline mr-2" />
					Upload Video File
				</button>
				<button
					type="button"
					onClick={() => {
						setUploadType("youtube");
						setVideoFile(null);
						setVideoPreview(videoToEdit?.url && videoToEdit?.isYouTube ? videoToEdit.url : "");
					}}
					className={`flex-1 py-2 px-4 rounded-md font-medium transition ${uploadType === "youtube" ? "bg-white text-brand shadow" : "text-gray-600 hover:text-gray-900"}`}
				>
					<LinkIcon size={20} className="inline mr-2" />
					YouTube URL
				</button>
			</div>

			{/* Video Upload or YouTube URL */}
			{uploadType === "file" ? (
				<div>
					<label className="block text-sm font-medium text-gray-900 mb-2">Video File {!videoToEdit && <span className="text-red-500">*</span>}</label>
					<div className="border-2 border-dashed border-light rounded-lg p-6 text-center hover:border-brand transition">
						<input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" id="video-upload" />
						<label htmlFor="video-upload" className="cursor-pointer">
							<VideoIcon size={48} className="mx-auto mb-2 text-gray-900" />
							<p className="text-sm text-gray-900">Click to upload video</p>
							<p className="text-xs text-gray-900 mt-1">MP4, MOV, AVI (Max 100MB)</p>
						</label>
					</div>
					{videoPreview && !formData.youtubeUrl && (
						<div className="mt-3">
							<video src={videoPreview} controls className="w-full rounded-lg max-h-64" />
						</div>
					)}
				</div>
			) : (
				<div>
					<label className="block text-sm font-medium text-gray-900 mb-2">YouTube URL {!videoToEdit && <span className="text-red-500">*</span>}</label>
					<div className="relative">
						<LinkIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input type="text" name="youtubeUrl" value={formData.youtubeUrl} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..." />
					</div>
					<p className="text-xs text-gray-500 mt-1">Enter a YouTube video URL or video ID</p>
					{videoPreview && formData.youtubeUrl && extractYouTubeId(formData.youtubeUrl) && (
						<div className="mt-3">
							<iframe src={videoPreview} className="w-full rounded-lg aspect-video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
						</div>
					)}
				</div>
			)}

			{/* Thumbnail Upload */}
			<div>
				<label className="block text-sm font-medium text-gray-900 mb-2">Thumbnail (Optional)</label>
				<div className="border-2 border-dashed border-light rounded-lg p-4 text-center hover:border-brand transition">
					<input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" id="thumbnail-upload" />
					<label htmlFor="thumbnail-upload" className="cursor-pointer">
						<Upload size={32} className="mx-auto mb-2 text-gray-900" />
						<p className="text-xs text-gray-900">Upload thumbnail image</p>
					</label>
				</div>
				{thumbnailPreview && (
					<div className="mt-3">
						<Image src={thumbnailPreview} alt="Thumbnail" width={400} height={200} className="w-full rounded-lg max-h-48 object-cover" />
					</div>
				)}
			</div>

			{/* Title - English */}
			<div>
				<label className="block text-sm font-medium text-gray-900 mb-2">
					Title (English) <span className="text-red-500">*</span>
				</label>
				<input type="text" name="title_en" value={formData.title_en} onChange={handleInputChange} required className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="Enter video title in English" />
			</div>

			{/* Title - Nepali */}
			<div>
				<label className="block text-sm font-medium text-gray-900 mb-2">Title (Nepali)</label>
				<input type="text" name="title_ne" value={formData.title_ne} onChange={handleInputChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="नेपालीमा शीर्षक लेख्नुहोस्" />
			</div>

			{/* Title - Norwegian */}
			<div>
				<label className="block text-sm font-medium text-gray-900 mb-2">Title (Norwegian)</label>
				<input type="text" name="title_no" value={formData.title_no} onChange={handleInputChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="Skriv tittel på norsk" />
			</div>

			{/* Category */}
			<div>
				<label className="block text-sm font-medium text-gray-900 mb-2">
					Category <span className="text-red-500">*</span>
				</label>
				<select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent">
					<option value="">Select category</option>
					<option value="Documentary">Documentary</option>
					<option value="Short Film">Short Film</option>
					<option value="Nature">Nature</option>
					<option value="Music Video">Music Video</option>
					<option value="Travel">Travel</option>
					<option value="Action">Action</option>
					<option value="Events">Events</option>
					<option value="Educational">Educational</option>
					<option value="Other">Other</option>
				</select>
			</div>

			{/* Duration */}
			<div>
				<label className="block text-sm font-medium text-gray-900 mb-2">Duration (e.g., 2:45)</label>
				<input type="text" name="duration" value={formData.duration} onChange={handleInputChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="2:45" />
			</div>

			{/* Creator - English */}
			<div>
				<label className="block text-sm font-medium text-gray-900 mb-2">Creator/Author (English)</label>
				<input type="text" name="creator_en" value={formData.creator_en} onChange={handleInputChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="PNSB-Norway" />
			</div>

			{/* Creator - Nepali */}
			<div>
				<label className="block text-sm font-medium text-gray-900 mb-2">Creator/Author (Nepali)</label>
				<input type="text" name="creator_ne" value={formData.creator_ne} onChange={handleInputChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="आरएसपी नर्वे" />
			</div>

			{/* Description - English */}
			<div>
				<label className="block text-sm font-medium text-gray-900 mb-2">Description (English)</label>
				<textarea name="description_en" value={formData.description_en} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="Enter video description in English..." />
			</div>

			{/* Description - Nepali */}
			<div>
				<label className="block text-sm font-medium text-gray-900 mb-2">Description (Nepali)</label>
				<textarea name="description_ne" value={formData.description_ne} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="नेपालीमा विवरण लेख्नुहोस्..." />
			</div>

			{/* Description - Norwegian */}
			<div>
				<label className="block text-sm font-medium text-gray-900 mb-2">Description (Norwegian)</label>
				<textarea name="description_no" value={formData.description_no} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="Skriv beskrivelse på norsk..." />
			</div>

			{/* Buttons */}
			<div className="flex justify-end gap-3 pt-4 border-t">
				<button type="button" onClick={onClose} disabled={loading} className="px-6 py-2 border border-light rounded-lg hover:bg-light disabled:opacity-50">
					Cancel
				</button>
				<button type="submit" disabled={loading || (uploadType === "file" && !videoFile && !videoToEdit) || (uploadType === "youtube" && !formData.youtubeUrl) || !formData.title_en || !formData.category} className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed">
					{loading ? "Uploading..." : videoToEdit ? "Update Video" : "Upload Video"}
				</button>
			</div>
		</form>
	);
}
