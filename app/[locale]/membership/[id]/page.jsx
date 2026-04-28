import MemberDetailClient from "./MemberDetailClient";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import { notFound } from "next/navigation";

export default async function MemberDetailPage({ params }) {
	const { id } = await params;

	let member = null;

	try {
		await connectDB();
		const memberData = await Membership.findById(id).lean();

		if (!memberData) {
			notFound();
		}

		// Convert to plain object and serialize dates
		member = {
			...memberData,
			_id: memberData._id.toString(),
			createdAt: memberData.createdAt?.toISOString() || new Date().toISOString(),
		};
	} catch (error) {
		console.error("Error fetching member:", error);
		notFound();
	}

	return <MemberDetailClient member={member} />;
}

export async function generateMetadata({ params }) {
	const { id } = await params;

	try {
		await connectDB();
		const member = await Membership.findById(id).lean();

		if (!member) {
			return {
				title: "Member Not Found | PNSB-Norway",
			};
		}

		return {
			title: `${member.fullName} | PNSB-Norway Membership`,
			description: `View the membership profile of ${member.fullName} from ${member.city}, ${member.province || "Norway"}`,
			openGraph: {
				title: `${member.fullName} | PNSB-Norway`,
				description: `Member profile: ${member.profession || member.membershipType}`,
				images: member.profilePhoto ? [member.profilePhoto] : [],
			},
		};
	} catch {
		return {
			title: "Member Profile | PNSB-Norway",
		};
	}
}
