"use client";
import React, { useState, useEffect, useCallback } from "react";
import VideoForm from "@/components/VideoForm";
import { Edit, Trash2, Video as VideoIcon } from "lucide-react";
import Image from "next/image";

type Video = {
	_id: string;
	url: string;
	thumbnail?: string;
	title: string;
	category: string;
	duration?: string;
	description?: string;
	creator?: string;
	createdAt: string;
};

export default function VideosPage() {
	const [videos, setVideos] = useState<Video[]>([]);
	const [openModal, setOpenModal] = useState(false);
	const [videoToEdit, setVideoToEdit] = useState<Video | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const fetchVideos = async (): Promise<Video[]> => {
		const res = await fetch("/api/videos");
		const data = await res.json();
		return data.videos || [];
	};

	const loadVideos = useCallback(async () => {
		try {
			setLoading(true);
			const data = await fetchVideos();
			setVideos(data);
		} catch (err) {
			setError("Failed to load videos: " + (err instanceof Error ? err.message : String(err)));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadVideos();
	}, [loadVideos]);

	const handleEdit = (video: Video) => {
		setVideoToEdit(video);
		setOpenModal(true);
	};

	const handleDelete = async (id: string) => {
		if (!window.confirm("Are you sure you want to delete this video? This will also delete it from Cloudinary.")) return;

		try {
			const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
			if (!res.ok) throw new Error("Failed to delete");
			alert("Video deleted successfully!");
			await loadVideos();
		} catch (err) {
			alert("Delete failed: " + (err instanceof Error ? err.message : String(err)));
		}
	};

	const handleCloseModal = () => {
		setOpenModal(false);
		setVideoToEdit(null);
		loadVideos();
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
			</div>
		);
	}

	return (
		<div className="px-4">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Manage Videos</h1>
				<button
					className="bg-brand_primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 flex items-center gap-2"
					onClick={() => {
						setVideoToEdit(null);
						setOpenModal(!openModal);
					}}
				>
					<VideoIcon size={20} />
					{openModal ? "Cancel" : "Upload Video"}
				</button>
			</div>
			{error && <div className="mb-4 p-4 bg-red-50 border border-red-6000 text-red-600 rounded">{error}</div>}

			{/* Inline Form Section */}
			{openModal && (
				<div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-brand">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">{videoToEdit ? "Edit Video" : "Upload New Video"}</h2>
					<VideoForm videoToEdit={videoToEdit as unknown as undefined} onClose={handleCloseModal} />
				</div>
			)}

			{videos.length === 0 ? (
				<div className="text-center py-12 bg-light rounded-lg">
					<VideoIcon size={64} className="mx-auto text-gray-900 mb-4" />
					<p className="text-gray-900 text-lg mb-4">No videos uploaded yet</p>
					<button className="bg-brand_primary text-white px-6 py-2 rounded-lg hover:bg-red-800" onClick={() => setOpenModal(true)}>
						Upload Your First Video
					</button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{videos.map((video) => (
						<div key={video._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
							{/* Video Thumbnail/Preview */}
							<div className="relative aspect-video bg-neutral-900">
								{video.thumbnail ? <Image src={video.thumbnail} alt={video.title} width={400} height={225} className="w-full h-full object-cover object-top" /> : <video src={video.url} className="w-full h-full object-cover object-top" />}
								{video.duration && <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">{video.duration}</div>}
							</div>

							{/* Video Info */}
							<div className="p-4">
								<div className="flex items-start justify-between mb-2">
									<div className="flex-1">
										<h3 className="font-bold text-lg mb-1">{video.title}</h3>
										<p className="text-sm text-gray-900">{video.category}</p>
										{video.creator && <p className="text-xs text-gray-900 mt-1">by {video.creator}</p>}
									</div>
								</div>

								{video.description && <p className="text-sm text-gray-900 mb-3 line-clamp-2">{video.description}</p>}

								<div className="flex justify-between items-center pt-3 border-t">
									<span className="text-xs text-gray-900">{new Date(video.createdAt).toLocaleDateString()}</span>
									<div className="flex gap-2">
										<button onClick={() => handleEdit(video)} className="p-2 text-brand_primary hover:bg-brand_primary/10 rounded transition" title="Edit">
											<Edit size={18} />
										</button>
										<button onClick={() => handleDelete(video._id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition" title="Delete">
											<Trash2 size={18} />
										</button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
