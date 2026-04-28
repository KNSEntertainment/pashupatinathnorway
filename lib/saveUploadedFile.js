import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export async function saveUploadedFile(file, subfolder = "downloads") {
	if (!file || typeof file.name !== "string" || typeof file.arrayBuffer !== "function") {
		throw new Error("Invalid file provided");
	}

	const uploadsDir = path.join(process.cwd(), "public", "uploads", subfolder);
	await fs.mkdir(uploadsDir, { recursive: true });

	const ext = path.extname(file.name) || "";
	const base = path.basename(file.name, ext).replace(/[^a-z0-9-_]/gi, "-");
	const filename = `${base || "file"}-${randomUUID()}${ext}`;
	const filePath = path.join(uploadsDir, filename);

	const buffer = Buffer.from(await file.arrayBuffer());
	await fs.writeFile(filePath, buffer);

	return {
		url: `/uploads/${subfolder}/${filename}`,
		name: file.name,
		size: file.size,
		type: file.type,
	};
}
