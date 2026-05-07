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
	firstName: string;
	middleName?: string;
	lastName: string;
	email: string;
	membershipId: string;
	phone: string;
	address: string;
	city: string;
	postalCode: string;
	personalNumber?: string;
	gender: string;
	fylke?: string;
	kommune?: string;
	membershipType: "General" | "Active" | "executive";
	membershipStatus: "blocked" | "pending" | "approved";
	agreeTerms: boolean;
	profilePhoto?: string;
	password?: string;
	passwordSetupToken?: string;
	passwordSetupTokenExpiry?: Date;
	passwordResetToken?: string;
	passwordResetTokenExpiry?: Date;
	createdAt: string;
	updatedAt: string;
	generalMemberSince?: string;
	activeMemberSince?: string;
}

export interface LocalizedString {
	en?: string;
	no?: string;
	ne?: string;
}

// Store/E-commerce types
export interface Product {
	_id: string;
	name: LocalizedString;
	description: LocalizedString;
	price: number;
	currency: string;
	category: "product" | "service";
	type: string; // e.g., "book", "puja", "consultation"
	imageUrl: string;
	images?: string[];
	inStock: boolean;
	stockQuantity?: number;
	isDigital: boolean;
	downloadUrl?: string;
	features?: LocalizedString[];
	specifications?: Record<string, LocalizedString>;
	createdAt: string;
	updatedAt: string;
	isActive: boolean;
	tags?: string[];
}

export interface CartItem {
	product: Product;
	quantity: number;
	variant?: string;
}

export interface Cart {
	items: CartItem[];
	total: number;
	subtotal: number;
	tax: number;
	shipping: number;
	currency: string;
}

export interface Order {
	_id: string;
	customerInfo: {
		name: string;
		email: string;
		phone: string;
		address?: string;
		city?: string;
		postalCode?: string;
	};
	items: CartItem[];
	total: number;
	subtotal: number;
	tax: number;
	shipping: number;
	currency: string;
	status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
	paymentStatus: "pending" | "completed" | "failed" | "refunded";
	paymentMethod: "stripe" | "vipps" | "other";
	stripeSessionId?: string;
	stripePaymentIntentId?: string;
	createdAt: string;
	updatedAt: string;
	notes?: string;
	trackingNumber?: string;
}

export interface StoreFilters {
	category: "all" | "product" | "service";
	type: string;
	sortBy: "date" | "price-asc" | "price-desc" | "name-asc" | "name-desc";
	search: string;
}
