import Membership from "@/models/Membership.Model";
import ManagementHistory from "@/models/ManagementHistory.Model";

interface BoardMemberDoc {
	_id: unknown;
	firstName: string;
	middleName?: string;
	lastName: string;
	position?: string;
	membershipType: string;
	boardTermStart?: Date;
	displayOrder?: number;
}

export async function archiveBoardMembers(members: BoardMemberDoc[], termEnd: Date, fallbackTermStart: Date | null, resigned: boolean) {
	const historyDocs = members.map((member) => ({
		originalMembershipId: member._id,
		firstName: member.firstName,
		middleName: member.middleName,
		lastName: member.lastName,
		position: member.position || member.membershipType,
		membershipType: member.membershipType,
		termStart: member.boardTermStart || fallbackTermStart,
		termEnd,
		displayOrder: member.displayOrder,
		resigned,
	}));

	const created = await ManagementHistory.insertMany(historyDocs);

	await Membership.updateMany(
		{ _id: { $in: members.map((member) => member._id) } },
		{
			$set: { membershipType: "Active", displayOrder: 0 },
			$unset: { position: "", boardTermStart: "" },
		}
	);

	return created;
}
