"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Mail, Phone } from "lucide-react";
import ExecutiveMemberForm from "@/components/ExecutiveMemberForm";
import Image from "next/image";

interface Member {
	_id: string;
	name: string;
	email: string;
	phone: string;
	position?: string;
	department?: string;
	subdepartment?: string;
	imageUrl?: string;
}

export default function ExecutiveMembersAdmin() {
	const [members, setMembers] = useState<Member[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

	useEffect(() => {
		fetchMembers();
	}, []);

	const fetchMembers = async () => {
		try {
			const response = await fetch("/api/executive-members");
			const data = await response.json();
			setMembers(data);
		} catch (error) {
			console.error("Error fetching members:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddMember = () => {
		setMemberToEdit(null);
		setShowModal(!showModal);
	};

	const handleEditMember = (member: Member) => {
		setMemberToEdit(member);
		setShowModal(true);
	};

	const handleDeleteMember = async (id: string) => {
		if (!confirm("Are you sure you want to delete this member?")) return;

		try {
			const response = await fetch(`/api/executive-members/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				fetchMembers();
			}
		} catch (error) {
			console.error("Error deleting member:", error);
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setMemberToEdit(null);
		fetchMembers();
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Executive Members</h1>
					<p className="text-gray-900 mt-1">Manage organization leadership</p>
				</div>
				<Button onClick={handleAddMember} className="bg-brand_primary hover:bg-brand_primary/90">
					{showModal ? (
						"Cancel"
					) : (
						<>
							<Plus className="w-4 h-4 mr-2" />
							Add Member
						</>
					)}
				</Button>
			</div>

			{/* Inline Form Section */}
			{showModal && (
				<div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-brand">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">{memberToEdit ? "Edit Member" : "Add New Member"}</h2>
					<ExecutiveMemberForm handleCloseModal={handleCloseModal} memberToEdit={memberToEdit as unknown as null} />
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{members.map((member: Member) => (
					<div key={member._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
						<div className="aspect-square overflow-hidden bg-light">
							{member.imageUrl && !member.imageUrl.startsWith("data:") ? (
								<Image src={member.imageUrl} alt={member.name} width={400} height={400} className="w-full h-full object-cover" />
							) : (
								<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand to-blue-600">
									<span className="text-white text-6xl font-bold">{member.name.charAt(0).toUpperCase()}</span>
								</div>
							)}
						</div>

						<div className="p-6">
							<h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
							{member.position && <p className="text-sm text-brand_primary font-medium mb-3">{member.position}</p>}

							<div className="space-y-2 mb-4">
								<a href={`tel:${member.phone}`} className="flex items-center gap-2 text-gray-900 hover:text-brand_primary text-sm">
									<Phone className="w-4 h-4" />
									{member.phone}
								</a>
								<a href={`mailto:${member.email}`} className="flex items-center gap-2 text-gray-900 hover:text-brand_primary text-sm break-all">
									<Mail className="w-4 h-4" />
									{member.email}
								</a>
							</div>

							<div className="flex gap-2 pt-4 border-t border-neutral-100">
								<Button variant="outline" size="sm" onClick={() => handleEditMember(member)} className="flex-1">
									<Edit className="w-4 h-4 mr-1" />
									Edit
								</Button>
								<Button variant="outline" size="sm" onClick={() => handleDeleteMember(member._id)} className="text-red-600 hover:text-red-600 hover:bg-red-50">
									<Trash2 className="w-4 h-4 mr-1" />
									Delete
								</Button>
							</div>
						</div>
					</div>
				))}
			</div>

			{members.length === 0 && (
				<div className="text-center py-12">
					<p className="text-gray-900 text-lg mb-4">No executive members added yet.</p>
					<Button onClick={handleAddMember} className="bg-brand_primary hover:bg-brand_primary/90">
						<Plus className="w-4 h-4 mr-2" />
						Add Your First Member
					</Button>
				</div>
			)}
		</div>
	);
}
