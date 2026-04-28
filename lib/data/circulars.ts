import Circular from "@/models/Circular.Model";
import DBConnect from "@/lib/mongodb";
import { LocalizedString } from "@/types";

interface CircularDocument {
	_id: string;
	slug: string;
	circularTitle: LocalizedString;
	circularDesc: LocalizedString;
	circularAuthor: LocalizedString;
	circularMainPicture?: string;
	circularSecondPicture?: string;
	circularPdfUrl?: string;
	publicationStatus: string;
	circularPublishedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export async function getCirculars() {
	await DBConnect();
	return Circular.find().lean<CircularDocument[]>();
}

export async function getPublishedCirculars() {
	await DBConnect();
	return Circular.find({ publicationStatus: "published" }).sort({ circularPublishedAt: -1 }).lean<CircularDocument[]>();
}

export async function getCircularBySlug(slug: string) {
	await DBConnect();
	return Circular.findOne({ slug, publicationStatus: "published" }).lean<CircularDocument | null>();
}
