"use client";

import React from "react";
import useFetchData from "@/hooks/useFetchData";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MessageCircleReply, Trash2 } from "lucide-react";

export default function EventsPage() {
	const { data: messages, error, loading, mutate } = useFetchData("/api/messages", "messages");

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	const handleDelete = async (id) => {
		try {
			const response = await fetch(`/api/messages/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error("Failed to delete message");
			}
			mutate();
		} catch (error) {
			alert("Failed to delete message. Please try again." + error);
		}
	};
	const handleReplyEmail = (email) => {
		const subject = encodeURIComponent("Re: Your message to KNS");
		const body = encodeURIComponent("Thank you for your message. We have received it and will get back to you shortly.");
		window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
	};

	return (
		<div className="max-w-6xl">
			<div className=" bg-white rounded-lg shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Message Sender</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Phone</TableHead>
							<TableHead>Message to PNSBN</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{messages?.length > 0 ? (
							messages.map((message) => (
								<TableRow key={message._id}>
									<TableCell className="font-semibold">{message.name}</TableCell>
									<TableCell>{message.email}</TableCell>

									<TableCell>{message.phone}</TableCell>
									<TableCell className="w-96">{message.message}</TableCell>
									<TableCell>
										<div className="flex space-x-2">
											<Button variant="ghost" size="icon" onClick={() => handleDelete(message._id)}>
												<Trash2 className="w-6 h-6 text-red-600" />
											</Button>
											<Button variant="ghost" size="icon" onClick={() => handleReplyEmail(message.email)}>
												<MessageCircleReply className="w-6 h-6 text-brand" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={5} className="text-left text-red-600">
									No messages have been received yet via contact form.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
