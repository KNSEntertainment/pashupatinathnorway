export interface Download {
	id: string;
	title_en: string;
	title_ne?: string;
	title_no?: string;
	date: string;
	fileUrl: string;
	imageUrl?: string;
	category: string;
	downloadCount: number;
	// Legacy field
	title?: string;
}
import { ObjectId } from "mongodb";

export interface Blog {
	_id: ObjectId;
	blogTitle_en: string;
	blogTitle_ne?: string;
	blogTitle_no?: string;
	blogTitle?: string; // Legacy field
	blogDesc_en: string;
	blogDesc_ne?: string;
	blogDesc_no?: string;
	blogDesc?: string; // Legacy field
	blogDate: string;
	blogAuthor?: string;
	blogMainPicture: string;
	blogSecondPicture?: string;
	blogContent?: string;
	blogContent_en?: string;
	blogContent_ne?: string;
	blogContent_no?: string;
}

export interface Event {
	_id?: ObjectId;
	name: string;
	date: Date;
	location: string;
	description: string;
}

export interface Membership {
	_id: string;
	fullName: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	postalCode: string;
	dateOfBirth: string;
	gender: string;
	province?: string;
	district?: string;
	profession?: string;
	membershipType: "general" | "active" | "executive";
	membershipStatus: "blocked" | "pending" | "approved";
	nationalMembershipNo?: string;
	skills?: string;
	volunteerInterest?: string[];
	agreeTerms: boolean;
	permissionPhotos?: boolean;
	permissionPhone?: boolean;
	permissionEmail?: boolean;
	profilePhoto?: string;
	createdAt: string;
}

export interface LocalizedString {
	en?: string;
	no?: string;
	ne?: string;
}
