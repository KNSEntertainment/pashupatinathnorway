//photoUploadService.js
import { v4 as uuidv4 } from "uuid";

/**
 * Converts a base64 data URL to a File object
 * @param {string} dataUrl - The data URL
 * @param {string} filename - The filename
 * @returns {File} - The File object
 */
export function dataURLtoFile(dataUrl, filename) {
	const arr = dataUrl.split(",");
	const mime = arr[0].match(/:(.*?);/)[1];
	const bstr = atob(arr[1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}

	return new File([u8arr], filename, { type: mime });
}

/**
 * Uploads a photo to the server
 * @param {string} photoDataUrl - The photo as a data URL
 * @returns {Promise<string>} - A promise that resolves to the URL of the uploaded photo
 */
export async function uploadPhoto(photoDataUrl) {
	if (!photoDataUrl) {
		throw new Error("No photo data provided");
	}

	try {
		// For a real implementation, you'd upload to S3, Cloudinary, etc.
		// Here we'll just mock a successful upload for demonstration

		// In a real app, convert to file and upload to a service
		const photoFile = dataURLtoFile(photoDataUrl, `child-photo-${uuidv4()}.jpg`);

		// Create a FormData object
		const formData = new FormData();
		formData.append("file", photoFile);

		// This would be your actual photo upload endpoint
		// const response = await fetch('/api/upload-photo', {
		//   method: 'POST',
		//   body: formData,
		// });

		// For this example, we'll just return a mock URL
		// In reality, you'd get the URL from your storage service

		// In a real app, return the URL from the upload service
		// For this example, we just return the data URL directly
		// WARNING: In a real app, don't store large data URLs in MongoDB!
		// Instead, upload to a storage service and store the URL
		return photoDataUrl;
	} catch (error) {
		console.error("Error uploading photo:", error);
		throw new Error("Failed to upload photo");
	}
}
