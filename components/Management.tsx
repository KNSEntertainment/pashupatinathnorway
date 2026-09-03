"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Lightbulb, History } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BoardMember {
	_id?: string;
	name: string;
	position: string;
	type: "executive" | "member" | "advisor";
	membershipId?: string;
	email?: string;
	phone?: string;
	displayOrder?: number;
}

interface MembershipData {
	_id: string;
	firstName: string;
	middleName?: string;
	lastName: string;
	membershipType: string;
	membershipId: string;
	email: string;
	phone: string;
	position?: string;
	displayOrder?: number;
}

interface PastBoardMember {
	_id: string;
	name: string;
	position: string;
	type: "executive" | "advisor";
	termLabel: string;
	termEndYear: number;
	resigned: boolean;
}

interface ManagementHistoryData {
	_id: string;
	firstName: string;
	middleName?: string;
	lastName: string;
	position: string;
	membershipType: "Executive" | "Advisor";
	termStart: string;
	termEnd: string;
	resigned?: boolean;
}

const CURRENT_TENURE = "current";

function buildTermLabel(termStart: string, termEnd: string): string {
	const startYear = new Date(termStart).getFullYear();
	const endYear = new Date(termEnd).getFullYear();
	return startYear === endYear ? `${startYear}` : `${startYear}–${endYear}`;
}

export default function Management() {
	const t = useTranslations("management");
	const [members, setMembers] = useState<BoardMember[]>([]);
	const [pastMembers, setPastMembers] = useState<PastBoardMember[]>([]);
	const [selectedTenure, setSelectedTenure] = useState(CURRENT_TENURE);
	const [loading, setLoading] = useState(true);

	const fetchBoardMembers = useCallback(async () => {
		try {
			setLoading(true);

			// Fetch from membership system for executive and advisor types
			const membershipResponse = await fetch("/api/membership?type=Executive,Advisor");
			let members: BoardMember[] = [];
			if (membershipResponse.ok) {
				const membershipData = await membershipResponse.json();
				members = membershipData.map((member: MembershipData) => ({
					name: `${member.firstName} ${member.middleName ? member.middleName + " " : ""}${member.lastName}`,
					position: member.position || (member.membershipType === "Executive" ? t("executive_member") : t("advisor")),
					type: member.membershipType.toLowerCase() as "executive" | "advisor",
					membershipId: member.membershipId,
					email: member.email,
					phone: member.phone,
					displayOrder: member.displayOrder,
					_id: `membership-${member._id}`,
				}));
			}

			// Sort by type first, then by displayOrder for executives, then by name
			const sortedMembers = members.sort((a, b) => {
				const typeOrder: Record<string, number> = { executive: 0, advisor: 1 };
				if (typeOrder[a.type] !== typeOrder[b.type]) {
					return typeOrder[a.type] - typeOrder[b.type];
				}

				// For executive members, sort by displayOrder if available, then by name
				if (a.type === "executive" && b.type === "executive") {
					const aOrder = a.displayOrder ?? 999;
					const bOrder = b.displayOrder ?? 999;
					if (aOrder !== bOrder) {
						return aOrder - bOrder;
					}
				}

				return a.name.localeCompare(b.name);
			});

			setMembers(sortedMembers as BoardMember[]);

			// Fetch past board members (archived terms)
			const historyResponse = await fetch("/api/management-history");
			if (historyResponse.ok) {
				const historyData: ManagementHistoryData[] = await historyResponse.json();
				const past = historyData.map((record) => ({
					_id: record._id,
					name: `${record.firstName} ${record.middleName ? record.middleName + " " : ""}${record.lastName}`,
					position: record.position,
					type: record.membershipType.toLowerCase() as "executive" | "advisor",
					termLabel: buildTermLabel(record.termStart, record.termEnd),
					termEndYear: new Date(record.termEnd).getFullYear(),
					resigned: Boolean(record.resigned),
				}));
				setPastMembers(past);
			}
		} catch (error) {
			console.error("Error fetching members:", error);
			// If API fails, show empty array
			setMembers([]);
		} finally {
			setLoading(false);
		}
	}, [t]);

	useEffect(() => {
		fetchBoardMembers();
	}, [t, fetchBoardMembers]);

	// Filter members by type
	const executiveMembers = members.filter((m) => m.type === "executive");
	const advisors = members.filter((m) => m.type === "advisor");

	const tenureOptions = useMemo(() => {
		const labels = new Map<string, number>();
		pastMembers.forEach((m) => labels.set(m.termLabel, m.termEndYear));
		return Array.from(labels.entries())
			.sort((a, b) => b[1] - a[1])
			.map(([label]) => label);
	}, [pastMembers]);

	const selectedPastMembers = pastMembers.filter((m) => m.termLabel === selectedTenure);
	const selectedPastExecutives = selectedPastMembers.filter((m) => m.type === "executive");
	const selectedPastAdvisors = selectedPastMembers.filter((m) => m.type === "advisor");

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-12">
				<div className="container mx-auto px-4 max-w-7xl">
					<div className="flex items-center justify-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand_primary"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-12">
			<div className="container mx-auto px-4 max-w-7xl">
				<header className="text-center mb-6 md:mb-8">
					<SectionHeader heading={t("current_board_members")} subtitle={t("board_description")} />
				</header>

				{tenureOptions.length > 0 && (
					<div className="flex justify-center mb-8">
						<div className="w-full max-w-xs">
							<Select value={selectedTenure} onValueChange={setSelectedTenure}>
								<SelectTrigger>
									<SelectValue placeholder={t("tenure_filter_label")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={CURRENT_TENURE}>{t("current_term_option")}</SelectItem>
									{tenureOptions.map((label) => (
										<SelectItem key={label} value={label}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				)}
			</div>

			{/* Current Board Members Section */}
			<div className="container mx-auto px-6 max-w-5xl">
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
					{executiveMembers.map((member: BoardMember, index: number) => (
						<div key={member._id || index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-gray-100">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0">
									<div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg ${member.type === "executive" ? "bg-gradient-to-br from-brand_primary to-brand_primary" : "bg-gradient-to-br from-brand_primary to-brand_secondary"}`}>{member.name.charAt(0)}</div>
								</div>
								<div className="flex-1">
									<div className="flex flex-col items-start gap-1 mb-2">
										<h3 className="text-sm font-semibold text-gray-900">{member.name}</h3>
										<p className="text-xs text-gray-500">{member.position}</p>
										{/* {member.membershipId && (
                      <p className="text-xs text-gray-400">ID: {member.membershipId}</p>
                    )} */}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Advisors Section */}
			<div className="bg-gray-50 py-16">
				<div className="container mx-auto px-6 max-w-5xl">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
							<Lightbulb className="w-8 h-8 text-red-600" />
							{t("advisors_title")}
						</h2>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4  mx-auto">
						{advisors.map((advisor: BoardMember, index: number) => (
							<div key={advisor._id || index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-red-100">
								<div className="flex items-center gap-4">
									<div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-400 rounded-full flex items-center justify-center text-white font-bold">{advisor.name.charAt(0)}</div>
									<div>
										<h3 className="text-sm font-semibold text-gray-900">{advisor.name}</h3>
										<p className="text-xs text-gray-500">{advisor.position}</p>
										{/* {advisor.membershipId && (
                      <p className="text-xs text-gray-400">ID: {advisor.membershipId}</p>
                    )} */}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Past Board Members Section */}
			{selectedTenure !== CURRENT_TENURE && (
				<div className="py-16">
					<div className="container mx-auto px-6 max-w-5xl">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
								<History className="w-8 h-8 text-brand_primary" />
								{t("past_board_members")} — {selectedTenure}
							</h2>
						</div>

						{selectedPastMembers.length === 0 ? (
							<p className="text-center text-gray-500">{t("no_past_members_for_tenure")}</p>
						) : (
							<>
								{selectedPastExecutives.length > 0 && (
									<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
										{selectedPastExecutives.map((member) => (
											<div key={member._id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
												<div className="flex items-start gap-4">
													<div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-gray-400 to-gray-500 flex-shrink-0">{member.name.charAt(0)}</div>
													<div>
														<h3 className="text-sm font-semibold text-gray-900">{member.name}</h3>
														<p className="text-xs text-gray-500">{member.position}</p>
														<p className="text-xs text-gray-400">
															{member.termLabel}
															{member.resigned && ` · ${t("resigned_early")}`}
														</p>
													</div>
												</div>
											</div>
										))}
									</div>
								)}

								{selectedPastAdvisors.length > 0 && (
									<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
										{selectedPastAdvisors.map((member) => (
											<div key={member._id} className="bg-white rounded-xl shadow-md p-4 border border-red-100">
												<div className="flex items-start gap-4">
													<div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-red-400 to-red-300 flex-shrink-0">{member.name.charAt(0)}</div>
													<div>
														<h3 className="text-sm font-semibold text-gray-900">{member.name}</h3>
														<p className="text-xs text-gray-500">{member.position}</p>
														<p className="text-xs text-gray-400">
															{member.termLabel}
															{member.resigned && ` · ${t("resigned_early")}`}
														</p>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
