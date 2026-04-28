"use client";

import React, { useState } from "react";
import useFetchData from "@/hooks/useFetchData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import RegisterForm from "@/components/RegisterForm";

export default function UsersPage() {
	const [openUserModal, setOpenUserModal] = useState(false);
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedUserIds, setSelectedUserIds] = useState([]);
	const [bulkRole, setBulkRole] = useState("");
	const USERS_PER_PAGE = 10;
	const { data: users, error, loading, mutate } = useFetchData("/api/users", "users");

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this user?")) {
			try {
				const response = await fetch(`/api/users/${id}`, {
					method: "DELETE",
				});
				if (!response.ok) {
					throw new Error("Failed to delete user");
				}
				mutate();
			} catch (error) {
				console.error("Error deleting user:", error);
				alert("Failed to delete user. Please try again.");
			}
		}
	};

	const handleCloseUserModal = () => {
		setOpenUserModal(false);
		mutate();
	};

	const filteredUsers = users.filter((user) => {
		const matchesSearch = user.fullName?.toLowerCase().includes(search.toLowerCase()) || user.userName?.toLowerCase().includes(search.toLowerCase()) || user.email?.toLowerCase().includes(search.toLowerCase());
		const matchesRole = roleFilter ? user.role === roleFilter : true;
		return matchesSearch && matchesRole;
	});

	// Pagination logic (must be before allIdsOnPage)
	const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;
	const paginatedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

	const allIdsOnPage = paginatedUsers.map((u) => u._id);
	const allSelectedOnPage = allIdsOnPage.every((id) => selectedUserIds.includes(id));
	const handleSelectAll = (e) => {
		if (e.target.checked) {
			setSelectedUserIds((prev) => Array.from(new Set([...prev, ...allIdsOnPage])));
		} else {
			setSelectedUserIds((prev) => prev.filter((id) => !allIdsOnPage.includes(id)));
		}
	};

	const handleSelectUser = (id) => {
		setSelectedUserIds((prev) => (prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]));
	};

	const handleBulkDelete = async () => {
		if (!selectedUserIds.length) return;
		if (!window.confirm("Delete selected users?")) return;
		for (const id of selectedUserIds) {
			await fetch(`/api/users/${id}`, { method: "DELETE" });
		}
		setSelectedUserIds([]);
		mutate();
	};

	const handleBulkRoleChange = async () => {
		if (!selectedUserIds.length || !bulkRole) return;
		for (const id of selectedUserIds) {
			await fetch(`/api/users/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ role: bulkRole }),
			});
		}
		setSelectedUserIds([]);
		setBulkRole("");
		mutate();
	};

	const handlePageChange = (page) => {
		if (page >= 1 && page <= totalPages) setCurrentPage(page);
	};

	return (
		<div className="max-w-4xl">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
				<div className="flex gap-2 flex-1">
					<input type="text" placeholder="Search users..." className="border rounded px-3 py-2 w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
					<select className="border rounded px-2 py-2" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
						<option value="">All Roles</option>
						<option value="admin">Admin</option>
						<option value="user">User</option>
					</select>
				</div>
				<button onClick={() => setOpenUserModal(!openUserModal)} className="bg-brand_primary text-neutral-200 font-bold px-4 py-2">
					{openUserModal ? "Cancel" : "Register User"}
				</button>
			</div>

			{/* Bulk Actions Controls */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
				<div className="flex gap-4 flex-1 items-center pl-2">
					<input type="checkbox" checked={allSelectedOnPage} onChange={handleSelectAll} aria-label="Select all users on page" />
					<span>Select All</span>
					<button className="bg-brand_primary text-white px-3 py-1 rounded disabled:opacity-50" onClick={handleBulkDelete} disabled={selectedUserIds.length === 0}>
						Delete Selected
					</button>
					<select className="border rounded px-2 py-1" value={bulkRole} onChange={(e) => setBulkRole(e.target.value)} disabled={selectedUserIds.length === 0}>
						<option value="">Change Role</option>
						<option value="admin">Admin</option>
						<option value="user">User</option>
					</select>
					<button className="bg-brand_primary text-white px-3 py-1 rounded disabled:opacity-50" onClick={handleBulkRoleChange} disabled={selectedUserIds.length === 0 || !bulkRole}>
						Apply Role
					</button>
				</div>
			</div>

			{/* Inline Form Section */}
			{openUserModal && (
				<div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-brand">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">Register New User</h2>
					<RegisterForm handleCloseUserModal={handleCloseUserModal} fetchUsers={users} />
				</div>
			)}

			<div className=" bg-white rounded-lg shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>
								<input type="checkbox" checked={allSelectedOnPage} onChange={handleSelectAll} aria-label="Select all users on page" />
							</TableHead>
							<TableHead>Full Name</TableHead>
							<TableHead>Username</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedUsers.length > 0 ? (
							paginatedUsers.map((user) => (
								<TableRow key={user._id}>
									<TableCell>
										<input type="checkbox" checked={selectedUserIds.includes(user._id)} onChange={() => handleSelectUser(user._id)} aria-label={`Select user ${user.fullName}`} />
									</TableCell>
									<TableCell className="w-96 font-semibold">{user.fullName}</TableCell>
									<TableCell className="w-96">{user.userName}</TableCell>
									<TableCell className="w-96">{user.email} </TableCell>
									<TableCell>
										<div className="flex space-x-2">
											<Button variant="ghost" size="icon" onClick={() => handleDelete(user._id)}>
												<Trash2 className="w-6 h-6 text-red-600" />
											</Button>
											<Button variant="outline" size="sm" onClick={() => setEditUser(user)}>
												Edit
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={6} className="text-center">
									No user has been created yet. Please create one if needed.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
				{/* Pagination Controls */}
				{totalPages > 1 && (
					<div className="flex justify-center items-center gap-2 py-4">
						<button className="px-3 py-1 rounded border bg-light disabled:opacity-50" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
							Prev
						</button>
						{Array.from({ length: totalPages }, (_, i) => (
							<button key={i + 1} className={`px-3 py-1 rounded border ${currentPage === i + 1 ? "bg-red-800 text-white" : "bg-light"}`} onClick={() => handlePageChange(i + 1)}>
								{i + 1}
							</button>
						))}
						<button className="px-3 py-1 rounded border bg-light disabled:opacity-50" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
							Next
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
