// "use client";

// import SectionHeader from "@/components/SectionHeader";
// import Image from "next/image";
// import { Phone, Mail, Search, X, Filter, ChevronRight, UserPlus } from "lucide-react";
// import { useState, useEffect, useCallback } from "react";
// import { useLocale, useTranslations } from "next-intl";
// import { useSession } from "next-auth/react";
// import Link from "next/link";

// /**
//  * @typedef {Object} ExecutiveMember
//  * @property {string} _id
//  * @property {string} name
//  * @property {string} email
//  * @property {string} phone
//  * @property {string} [imageUrl]
//  * @property {string} [position]
//  * @property {string} [department]
//  * @property {string} [subdepartment]
//  * @property {string[]} [tags]
//  */

// /**
//  * @typedef {Object} RegularMember
//  * @property {string} _id
//  * @property {string} fullName
//  * @property {string} email
//  * @property {string} [phone]
//  * @property {string} [profilePhoto]
//  * @property {string} membershipType
//  * @property {string} membershipStatus
//  * @property {string} [city]
//  * @property {string} [province]
//  * @property {string} [profession]
//  * @property {string} createdAt
//  */

// /**
//  * @typedef {Object} Department
//  * @property {string} _id
//  * @property {string} name
//  * @property {string[]} subdepartments
//  * @property {number} order
//  * @property {boolean} isActive
//  */

// /**
//  * @typedef {Object} Filters
//  * @property {string|null} department
//  * @property {string|null} subdepartment
//  * @property {string} search
//  */

// export default function Members() {
// 	const t = useTranslations("members");
// 	const locale = useLocale();
// 	const { data: session } = useSession();
// 	const [executiveMembers, setExecutiveMembers] = useState([]);
// 	const [regularMembers, setRegularMembers] = useState([]);
// 	const [departments, setDepartments] = useState([]);
// 	const [filteredExecutiveMembers, setFilteredExecutiveMembers] = useState([]);
// 	const [filteredActiveMembers, setFilteredActiveMembers] = useState([]);
// 	const [filteredGeneralMembers, setFilteredGeneralMembers] = useState([]);
// 	const [loading, setLoading] = useState(true);
// 	const [filters, setFilters] = useState({
// 		department: null,
// 		subdepartment: null,
// 		search: "",
// 	});
// 	const [activeDepartment, setActiveDepartment] = useState(null);
// 	const [activeSubdepartment, setActiveSubdepartment] = useState(null);
// 	const [showMobileFilters, setShowMobileFilters] = useState(false);

// 	useEffect(() => {
// 		async function fetchData() {
// 			try {
// 				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
// 				const timestamp = new Date().getTime();

// 				const [executiveMembersResponse, regularMembersResponse, departmentsResponse] = await Promise.all([
// 					fetch(`${baseUrl}/api/executive-members/unified?t=${timestamp}`, {
// 						cache: "no-store",
// 						headers: {
// 							"Cache-Control": "no-cache, no-store, must-revalidate",
// 							Pragma: "no-cache",
// 							Expires: "0",
// 						},
// 					}),
// 					fetch(`${baseUrl}/api/membership?t=${timestamp}`, {
// 						cache: "no-store",
// 						headers: {
// 							"Cache-Control": "no-cache, no-store, must-revalidate",
// 							Pragma: "no-cache",
// 							Expires: "0",
// 						},
// 					}),
// 					fetch(`${baseUrl}/api/departments?t=${timestamp}`, {
// 						cache: "no-store",
// 						headers: {
// 							"Cache-Control": "no-cache, no-store, must-revalidate",
// 							Pragma: "no-cache",
// 							Expires: "0",
// 						},
// 					}),
// 				]);

// 				if (executiveMembersResponse.ok) {
// 					const executiveMembersData = await executiveMembersResponse.json();
// 					setExecutiveMembers(executiveMembersData);
// 				}

// 				if (regularMembersResponse.ok) {
// 					const regularMembersData = await regularMembersResponse.json();
// 					// The API returns a direct array, not wrapped in a success object
// 					// Filter out executive members since they're now handled by unified endpoint
// 					const members = regularMembersData.filter((member) => member.membershipStatus === "approved" && member.membershipType !== "executive");
// 					setRegularMembers(members);
// 				}

// 				if (departmentsResponse.ok) {
// 					const departmentsData = await departmentsResponse.json();
// 					if (departmentsData.success) {
// 						const depts = departmentsData.departments;
// 						setDepartments(depts);
// 					}
// 				}
// 			} catch (error) {
// 				console.error("Error fetching data:", error);
// 				setExecutiveMembers([]);
// 				setRegularMembers([]);
// 				setFilteredExecutiveMembers([]);
// 				setFilteredActiveMembers([]);
// 				setFilteredGeneralMembers([]);
// 				setDepartments([]);
// 			} finally {
// 				setLoading(false);
// 			}
// 		}

// 		fetchData();
// 	}, []);

// 	// Initialize filtered members when data changes
// 	useEffect(() => {
// 		console.log("Regular members:", regularMembers);
// 		console.log("Executive members:", executiveMembers);

// 		// Set initial filtered members without applying filters
// 		// Filter out executive members from regular members since they're handled by unified endpoint
// 		const activeMembers = regularMembers.filter((member) => member.membershipType === "active");
// 		const generalMembers = regularMembers.filter((member) => member.membershipType === "general");

// 		setFilteredExecutiveMembers(executiveMembers);
// 		setFilteredActiveMembers(activeMembers);
// 		setFilteredGeneralMembers(generalMembers);
// 	}, [regularMembers, executiveMembers]);

// 	// Apply filters to all member types
// 	const applyFilters = useCallback(() => {
// 		// Filter executive members
// 		let executiveFiltered = [...executiveMembers];
// 		if (filters.department) {
// 			executiveFiltered = executiveFiltered.filter((m) => m.department === filters.department);
// 		}
// 		if (filters.subdepartment) {
// 			executiveFiltered = executiveFiltered.filter((m) => m.subdepartment === filters.subdepartment);
// 		}
// 		if (filters.search) {
// 			const searchLower = filters.search.toLowerCase();
// 			executiveFiltered = executiveFiltered.filter((m) => m.name.toLowerCase().includes(searchLower) || m.position?.toLowerCase().includes(searchLower) || m.email.toLowerCase().includes(searchLower));
// 		}

// 		// Filter regular members (active and general)
// 		let activeFiltered = regularMembers.filter((member) => member.membershipType === "active");
// 		let generalFiltered = regularMembers.filter((member) => member.membershipType === "general");

// 		// Apply department filtering to regular members based on location mapping
// 		if (filters.department) {
// 			// Map department to province/district for regular members
// 			const departmentProvinceMap = {
// 				"Information and Technology Department": "province-3",
// 				// Add more mappings as needed
// 			};

// 			const targetProvince = departmentProvinceMap[filters.department];
// 			if (targetProvince) {
// 				activeFiltered = activeFiltered.filter((m) => m.province === targetProvince);
// 				generalFiltered = generalFiltered.filter((m) => m.province === targetProvince);
// 			}
// 		}

// 		// Apply subdepartment filtering to regular members based on city mapping
// 		if (filters.subdepartment) {
// 			// Map subdepartment to city for regular members
// 			const subdepartmentCityMap = {
// 				IT: "Oslo",
// 				"IT Online News": "Oslo",
// 				// Add more mappings as needed
// 			};

// 			const targetCity = subdepartmentCityMap[filters.subdepartment];
// 			if (targetCity) {
// 				activeFiltered = activeFiltered.filter((m) => m.city?.toLowerCase() === targetCity.toLowerCase());
// 				generalFiltered = generalFiltered.filter((m) => m.city?.toLowerCase() === targetCity.toLowerCase());
// 			}
// 		}

// 		// Apply search filtering to regular members
// 		if (filters.search) {
// 			const searchLower = filters.search.toLowerCase();
// 			activeFiltered = activeFiltered.filter((m) => m.fullName.toLowerCase().includes(searchLower) || m.email.toLowerCase().includes(searchLower) || m.profession?.toLowerCase().includes(searchLower));
// 			generalFiltered = generalFiltered.filter((m) => m.fullName.toLowerCase().includes(searchLower) || m.email.toLowerCase().includes(searchLower) || m.profession?.toLowerCase().includes(searchLower));
// 		}

// 		setFilteredExecutiveMembers(executiveFiltered);
// 		setFilteredActiveMembers(activeFiltered);
// 		setFilteredGeneralMembers(generalFiltered);
// 	}, [executiveMembers, regularMembers, filters]);

// 	useEffect(() => {
// 		applyFilters();
// 	}, [applyFilters]);

// 	const selectDepartment = (deptName) => {
// 		if (activeDepartment === deptName) {
// 			setActiveDepartment(null);
// 			setActiveSubdepartment(null);
// 			setFilters({ ...filters, department: null, subdepartment: null });
// 		} else {
// 			setActiveDepartment(deptName);
// 			setActiveSubdepartment(null);
// 			setFilters({ ...filters, department: deptName, subdepartment: null });
// 		}
// 	};

// 	const selectSubdepartment = (subdept) => {
// 		if (activeSubdepartment === subdept) {
// 			setActiveSubdepartment(null);
// 			setFilters({ ...filters, subdepartment: null });
// 		} else {
// 			setActiveSubdepartment(subdept);
// 			setFilters({ ...filters, subdepartment: subdept });
// 		}
// 	};

// 	const clearAllFilters = () => {
// 		setFilters({
// 			department: null,
// 			subdepartment: null,
// 			search: "",
// 		});
// 		setActiveDepartment(null);
// 		setActiveSubdepartment(null);
// 	};

// 	const removeFilter = (filterType) => {
// 		if (filterType === "department") {
// 			setActiveDepartment(null);
// 			setActiveSubdepartment(null);
// 			setFilters({ ...filters, department: null, subdepartment: null });
// 		} else if (filterType === "subdepartment") {
// 			setActiveSubdepartment(null);
// 			setFilters({ ...filters, subdepartment: null });
// 		}
// 	};

// 	const getActiveDepartmentSubdepartments = () => {
// 		if (!activeDepartment) return [];
// 		const dept = departments.find((d) => d.name === activeDepartment);
// 		return dept?.subdepartments || [];
// 	};

// 	const hasActiveFilters = filters.department || filters.subdepartment || filters.search;

// 	if (loading) {
// 		return (
// 			<div className="min-h-screen flex items-center justify-center">
// 				<div className="text-center">
// 					<div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent mb-4"></div>
// 					<p className="text-gray-700 text-lg">{t("loading")}</p>
// 				</div>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="min-h-screen pt-12">
// 			{/* Header Section */}

// 			<SectionHeader heading={t("title")} subtitle={t("description")} className="mb-0" />

// 			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
// 				{/* Search and Filter Toggle */}
// 				<div className="mb-3">
// 					<div className="bg-white rounded-lg shadow-sm px-4 py-3">
// 						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
// 							{/* Right side: Become a Member Button */}
// 							{!session && (
// 								<div className="order-first sm:order-none sm:justify-end flex">
// 									<Link href={`/${locale}/membership`} className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
// 										<UserPlus className="h-4 w-4" />
// 										<span>{t("become_a_member")}</span>
// 									</Link>
// 								</div>
// 							)}

// 							{/* Left side: Search and Filter */}
// 							<div className="flex items-stretch sm:items-center gap-3 order-last sm:order-none">
// 								{/* Search Input */}
// 								<div className="flex">
// 									<div className="relative">
// 										<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
// 										<input type="text" id="search" placeholder={t("search_placeholder")} className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
// 										{filters.search && (
// 											<button onClick={() => setFilters({ ...filters, search: "" })} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
// 												<X className="h-4 w-4" />
// 											</button>
// 										)}
// 									</div>
// 								</div>

// 								{/* Filter Toggle */}
// 								<div className="flex items-center gap-2">
// 									<button onClick={() => setShowMobileFilters(!showMobileFilters)} className="inline-flex items-center gap-2 px-3 py-2 bg-brand_primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
// 										<Filter className="h-4 w-4" />
// 										<span>{t("filters")}</span>
// 										{hasActiveFilters && <span className="bg-white text-brand_primary rounded-full px-2 py-0.5 text-xs font-semibold">{[filters.department, filters.subdepartment].filter(Boolean).length}</span>}
// 									</button>
// 									{hasActiveFilters && (
// 										<button onClick={clearAllFilters} className="text-sm text-brand_primary hover:text-blue-700 font-medium">
// 											{t("clear_all")}
// 										</button>
// 									)}
// 								</div>
// 							</div>

// 							{/* Members Count */}
// 						</div>
// 						<div className="text-sm text-gray-700 sm:ml-auto m-2 text-left sm:text-right">
// 							<span className="text-brand_primary font-bold">{filteredExecutiveMembers.length}</span> {filteredExecutiveMembers.length === 1 ? t("executive_member") : t("executive_members")},<span className="text-brand_primary font-bold ml-2">{filteredActiveMembers.length}</span> {filteredActiveMembers.length === 1 ? t("active_member") : t("active_members")},<span className="text-brand_primary font-bold ml-2">{filteredGeneralMembers.length}</span> {filteredGeneralMembers.length === 1 ? t("general_member") : t("general_members")}
// 						</div>
// 					</div>
// 				</div>

// 				{/* Filters Section - Desktop and Mobile */}
// 				<div className={`mb-3 ${showMobileFilters ? "block" : "hidden"}`}>
// 					<div className="bg-white rounded-lg shadow-sm px-4 py-3">
// 						<div className="flex items-center justify-between mb-3">
// 							<h3 className="text-md font-bold text-brand_primary">{t("filters")}</h3>
// 						</div>

// 						{/* Departments */}
// 						<div className="mb-4">
// 							<div className="flex items-center justify-between mb-3">
// 								<h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t("departments")}</h3>
// 							</div>
// 							<div className="relative">
// 								<div className="flex overflow-x-auto gap-2 sm:gap-3 pb-2 scroll-smooth hide-scrollbar snap-x snap-mandatory">
// 									{departments.map((dept) => (
// 										<button key={dept._id} onClick={() => selectDepartment(dept.name)} className={`px-3 py-2 rounded-lg border transition-all duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand whitespace-nowrap flex-shrink-0 snap-start ${activeDepartment === dept.name ? "border-brand bg-blue-50 text-brand_primary shadow-sm" : "bg-white border-gray-200 text-gray-700 hover:border-brand hover:bg-blue-50 hover:text-brand_primary"}`}>
// 											{dept.name}
// 										</button>
// 									))}
// 								</div>
// 								{departments.length > 3 && (
// 									<div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none flex items-center justify-end pr-2">
// 										<ChevronRight className="w-5 h-5 text-gray-400" />
// 									</div>
// 								)}
// 							</div>
// 						</div>

// 						{/* Subdepartments */}
// 						{activeDepartment && getActiveDepartmentSubdepartments().length > 0 && (
// 							<div className="pt-4 border-t border-gray-200">
// 								<div className="flex items-center justify-between mb-3">
// 									<h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t("subdepartments")}</h3>
// 								</div>
// 								<div className="relative">
// 									<div className="flex overflow-x-auto gap-2 pb-2 scroll-smooth hide-scrollbar snap-x snap-mandatory">
// 										{getActiveDepartmentSubdepartments().map((subdept) => (
// 											<button key={subdept} onClick={() => selectSubdepartment(subdept)} className={`px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium whitespace-nowrap flex-shrink-0 snap-start ${activeSubdepartment === subdept ? "bg-blue-100 border-blue-400 text-brand_primary" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-brand_primary"}`}>
// 												{subdept}
// 											</button>
// 										))}
// 									</div>
// 									{getActiveDepartmentSubdepartments().length > 4 && (
// 										<div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none flex items-center justify-end pr-2">
// 											<ChevronRight className="w-5 h-5 text-gray-400" />
// 										</div>
// 									)}
// 								</div>
// 							</div>
// 						)}
// 					</div>

// 					<style jsx>{`
// 						.hide-scrollbar::-webkit-scrollbar {
// 							display: none;
// 						}
// 						.hide-scrollbar {
// 							-ms-overflow-style: none;
// 							scrollbar-width: none;
// 						}
// 					`}</style>
// 				</div>

// 				{/* Active Filters Pills */}
// 				{hasActiveFilters && (
// 					<div className="mb-4">
// 						<div className="bg-white rounded-lg shadow-sm px-4 py-3">
// 							<div className="flex flex-wrap items-center gap-2">
// 								<span className="text-sm font-medium text-gray-700">{t("active_filters")}:</span>
// 								{filters.department && (
// 									<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-brand_primary rounded-full text-sm font-medium">
// 										{filters.department}
// 										<button onClick={() => removeFilter("department")} className="hover:text-blue-900 transition-colors" aria-label="Remove department filter">
// 											<X className="w-4 h-4" />
// 										</button>
// 									</span>
// 								)}
// 								{filters.subdepartment && (
// 									<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-brand_primary rounded-full text-sm font-medium">
// 										{filters.subdepartment}
// 										<button onClick={() => removeFilter("subdepartment")} className="hover:text-blue-900 transition-colors" aria-label="Remove subdepartment filter">
// 											<X className="w-4 h-4" />
// 										</button>
// 									</span>
// 								)}
// 							</div>
// 						</div>
// 					</div>
// 				)}

// 				{/* Members Sections */}

// 				{/* Executive Members Section */}
// 				{filteredExecutiveMembers.length > 0 && (
// 					<div className="mb-8 md:mb-20 p-6 bg-brand_primary/5">
// 						<h2 className="text-2xl font-bold text-gray-900 mb-4">{t("executive_members")}</h2>
// 						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
// 							{filteredExecutiveMembers.map((member) => (
// 								<div key={member._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
// 									<div className="aspect-square overflow-hidden bg-light">
// 										{member.imageUrl && !member.imageUrl.startsWith("data:") ? (
// 											<Image src={member.imageUrl} alt={member.name} width={200} height={200} className="w-full h-full object-cover" />
// 										) : (
// 											<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand to-blue-600">
// 												<span className="text-white text-6xl font-bold">{member.name.charAt(0).toUpperCase()}</span>
// 											</div>
// 										)}
// 									</div>
// 									<div className="p-6">
// 										<h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
// 										{member.position && <p className="text-sm text-brand_primary font-medium mb-3">{member.position}</p>}
// 										{session?.user && (
// 											<div className="space-y-2 mb-4">
// 												<a href={`tel:${member.phone}`} className="flex items-center gap-2 text-gray-900 hover:text-brand_primary text-sm">
// 													<Phone className="w-4 h-4" />
// 													{member.phone}
// 												</a>
// 												<a href={`mailto:${member.email}`} className="flex items-center gap-2 text-gray-900 hover:text-brand_primary text-sm break-all">
// 													<Mail className="w-4 h-4" />
// 													{member.email}
// 												</a>
// 											</div>
// 										)}
// 									</div>
// 								</div>
// 							))}
// 						</div>
// 					</div>
// 				)}

// 				{/* Active Members Section */}
// 				{filteredActiveMembers.length > 0 && (
// 					<div className="mb-8 md:mb-20 p-6">
// 						<h2 className="text-2xl font-bold text-gray-900 mb-4">{t("active_members")}</h2>
// 						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
// 							{filteredActiveMembers.map((member) => (
// 								<div key={member._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
// 									<div className="aspect-square overflow-hidden bg-light">
// 										{member.profilePhoto && !member.profilePhoto.startsWith("data:") ? (
// 											<Image src={member.profilePhoto} alt={member.fullName} width={200} height={200} className="w-full h-full object-cover" />
// 										) : (
// 											<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
// 												<span className="text-white text-6xl font-bold">{member.fullName.charAt(0).toUpperCase()}</span>
// 											</div>
// 										)}
// 									</div>
// 									<div className="p-6">
// 										<h3 className="text-xl font-bold text-gray-900 mb-1">{member.fullName}</h3>
// 										<p className="text-sm text-green-600 font-medium mb-3">{t("active_member")}</p>
// 										<div className="space-y-2 mb-4">
// 											{member.phone && (
// 												<a href={`tel:${member.phone}`} className="flex items-center gap-2 text-gray-900 hover:text-brand_primary text-sm">
// 													<Phone className="w-4 h-4" />
// 													{member.phone}
// 												</a>
// 											)}
// 											<a href={`mailto:${member.email}`} className="flex items-center gap-2 text-gray-900 hover:text-brand_primary text-sm break-all">
// 												<Mail className="w-4 h-4" />
// 												{member.email}
// 											</a>
// 										</div>
// 									</div>
// 								</div>
// 							))}
// 						</div>
// 					</div>
// 				)}

// 				{/* General Members Section */}
// 				{filteredGeneralMembers.length > 0 && (
// 					<div className="mb-8">
// 						<h2 className="text-2xl font-bold text-gray-900 mb-4">{t("general_members")}</h2>
// 						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
// 							{filteredGeneralMembers.map((member) => (
// 								<div key={member._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
// 									<div className="aspect-square overflow-hidden bg-light">
// 										{member.profilePhoto && !member.profilePhoto.startsWith("data:") ? (
// 											<Image src={member.profilePhoto} alt={member.fullName} width={200} height={200} className="w-full h-full object-cover" />
// 										) : (
// 											<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-500 to-gray-600">
// 												<span className="text-white text-6xl font-bold">{member.fullName.charAt(0).toUpperCase()}</span>
// 											</div>
// 										)}
// 									</div>
// 									<div className="p-6">
// 										<h3 className="text-xl font-bold text-gray-900 mb-1">{member.fullName}</h3>
// 										<p className="text-sm text-gray-600 font-medium mb-3">{t("general_member")}</p>
// 										<div className="space-y-2 mb-4">
// 											{member.phone && (
// 												<a href={`tel:${member.phone}`} className="flex items-center gap-2 text-gray-900 hover:text-brand_primary text-sm">
// 													<Phone className="w-4 h-4" />
// 													{member.phone}
// 												</a>
// 											)}
// 											<a href={`mailto:${member.email}`} className="flex items-center gap-2 text-gray-900 hover:text-brand_primary text-sm break-all">
// 												<Mail className="w-4 h-4" />
// 												{member.email}
// 											</a>
// 										</div>
// 									</div>
// 								</div>
// 							))}
// 						</div>
// 					</div>
// 				)}

// 				{/* No Members Found */}
// 				{filteredExecutiveMembers.length === 0 && filteredActiveMembers.length === 0 && filteredGeneralMembers.length === 0 && (
// 					<div className="bg-white rounded-lg shadow-sm p-12 text-center">
// 						<div className="max-w-md mx-auto">
// 							<svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// 								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
// 							</svg>
// 							<h3 className="text-xl font-semibold text-gray-900 mb-2">{t("no_results")}</h3>
// 							<p className="text-gray-600 mb-6">{t("adjust_filters")}</p>
// 							{hasActiveFilters && (
// 								<button onClick={clearAllFilters} className="px-6 py-2.5 bg-brand_primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
// 									{t("clear_all")}
// 								</button>
// 							)}
// 						</div>
// 					</div>
// 				)}
// 			</div>
// 		</div>
// 	);
// }

"use client";

import SectionHeader from "@/components/SectionHeader";
import Image from "next/image";
import { Phone, Mail, Search, X, Filter, ChevronRight, UserPlus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import Link from "next/link";

/**
 * @typedef {Object} ExecutiveMember
 * @property {string} _id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} [imageUrl]
 * @property {string} [position]
 * @property {string} [department]
 * @property {string} [subdepartment]
 * @property {string[]} [tags]
 */

/**
 * @typedef {Object} RegularMember
 * @property {string} _id
 * @property {string} fullName
 * @property {string} email
 * @property {string} [phone]
 * @property {string} [profilePhoto]
 * @property {string} membershipType
 * @property {string} membershipStatus
 * @property {string} [city]
 * @property {string} [province]
 * @property {string} [profession]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Department
 * @property {string} _id
 * @property {string} name
 * @property {string[]} subdepartments
 * @property {number} order
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} Filters
 * @property {string|null} department
 * @property {string|null} subdepartment
 * @property {string} search
 */

/**
 * Shared member card used for executive, active, and general members.
 * - avatarGradient: Tailwind gradient classes for the fallback avatar background
 * - badgeLabel: text shown below the name (position for executives, type label for others)
 * - badgeClass: Tailwind text colour class for the badge
 * - showContact: whether phone/email are visible (session-gated for executives, always shown for others)
 */
function MemberCard({ name, email, phone, imageUrl, avatarGradient, badgeLabel, badgeClass, showContact, session }) {
	const initial = name?.charAt(0).toUpperCase() ?? "?";

	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
			{/* Avatar / Photo */}
			<div className="aspect-square overflow-hidden bg-light">
				{imageUrl && !imageUrl.startsWith("data:") ? (
					<Image src={imageUrl} alt={name} width={200} height={200} className="w-full h-full object-cover" />
				) : (
					<div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${avatarGradient}`}>
						<span className="text-white text-6xl font-bold">{initial}</span>
					</div>
				)}
			</div>

			{/* Info */}
			<div className="p-6">
				<h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
				{badgeLabel && <p className={`text-sm font-medium mb-3 ${badgeClass}`}>{badgeLabel}</p>}

				{/* Contact — mirrors executive card: only show when session exists */}
				{showContact && session?.user && (
					<div className="space-y-2 mb-4">
						{phone && (
							<a href={`tel:${phone}`} className="flex items-center gap-2 text-gray-900 hover:text-brand_primary text-sm">
								<Phone className="w-4 h-4" />
								{phone}
							</a>
						)}
						<a href={`mailto:${email}`} className="flex items-center gap-2 text-gray-900 hover:text-brand_primary text-sm break-all">
							<Mail className="w-4 h-4" />
							{email}
						</a>
					</div>
				)}
			</div>
		</div>
	);
}

export default function Members() {
	const t = useTranslations("members");
	const locale = useLocale();
	const { data: session } = useSession();
	const [executiveMembers, setExecutiveMembers] = useState([]);
	const [regularMembers, setRegularMembers] = useState([]);
	const [departments, setDepartments] = useState([]);
	const [filteredExecutiveMembers, setFilteredExecutiveMembers] = useState([]);
	const [filteredActiveMembers, setFilteredActiveMembers] = useState([]);
	const [filteredGeneralMembers, setFilteredGeneralMembers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState({
		department: null,
		subdepartment: null,
		search: "",
	});
	const [activeDepartment, setActiveDepartment] = useState(null);
	const [activeSubdepartment, setActiveSubdepartment] = useState(null);
	const [showMobileFilters, setShowMobileFilters] = useState(false);

	useEffect(() => {
		async function fetchData() {
			try {
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
				const timestamp = new Date().getTime();

				const [executiveMembersResponse, regularMembersResponse, departmentsResponse] = await Promise.all([
					fetch(`${baseUrl}/api/executive-members/unified?t=${timestamp}`, {
						cache: "no-store",
						headers: {
							"Cache-Control": "no-cache, no-store, must-revalidate",
							Pragma: "no-cache",
							Expires: "0",
						},
					}),
					fetch(`${baseUrl}/api/membership?t=${timestamp}`, {
						cache: "no-store",
						headers: {
							"Cache-Control": "no-cache, no-store, must-revalidate",
							Pragma: "no-cache",
							Expires: "0",
						},
					}),
					fetch(`${baseUrl}/api/departments?t=${timestamp}`, {
						cache: "no-store",
						headers: {
							"Cache-Control": "no-cache, no-store, must-revalidate",
							Pragma: "no-cache",
							Expires: "0",
						},
					}),
				]);

				if (executiveMembersResponse.ok) {
					const executiveMembersData = await executiveMembersResponse.json();
					setExecutiveMembers(executiveMembersData);
				}

				if (regularMembersResponse.ok) {
					const regularMembersData = await regularMembersResponse.json();
					const members = regularMembersData.filter((member) => member.membershipStatus === "approved" && member.membershipType !== "executive");
					setRegularMembers(members);
				}

				if (departmentsResponse.ok) {
					const departmentsData = await departmentsResponse.json();
					if (departmentsData.success) {
						setDepartments(departmentsData.departments);
					}
				}
			} catch (error) {
				console.error("Error fetching data:", error);
				setExecutiveMembers([]);
				setRegularMembers([]);
				setFilteredExecutiveMembers([]);
				setFilteredActiveMembers([]);
				setFilteredGeneralMembers([]);
				setDepartments([]);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	useEffect(() => {
		const activeMembers = regularMembers.filter((m) => m.membershipType === "active");
		const generalMembers = regularMembers.filter((m) => m.membershipType === "general");
		setFilteredExecutiveMembers(executiveMembers);
		setFilteredActiveMembers(activeMembers);
		setFilteredGeneralMembers(generalMembers);
	}, [regularMembers, executiveMembers]);

	const applyFilters = useCallback(() => {
		let executiveFiltered = [...executiveMembers];
		if (filters.department) {
			executiveFiltered = executiveFiltered.filter((m) => m.department === filters.department);
		}
		if (filters.subdepartment) {
			executiveFiltered = executiveFiltered.filter((m) => m.subdepartment === filters.subdepartment);
		}
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			executiveFiltered = executiveFiltered.filter((m) => m.name.toLowerCase().includes(searchLower) || m.position?.toLowerCase().includes(searchLower) || m.email.toLowerCase().includes(searchLower));
		}

		let activeFiltered = regularMembers.filter((m) => m.membershipType === "active");
		let generalFiltered = regularMembers.filter((m) => m.membershipType === "general");

		if (filters.department) {
			const departmentProvinceMap = {
				"Information and Technology Department": "province-3",
			};
			const targetProvince = departmentProvinceMap[filters.department];
			if (targetProvince) {
				activeFiltered = activeFiltered.filter((m) => m.province === targetProvince);
				generalFiltered = generalFiltered.filter((m) => m.province === targetProvince);
			}
		}

		if (filters.subdepartment) {
			const subdepartmentCityMap = {
				IT: "Oslo",
				"IT Online News": "Oslo",
			};
			const targetCity = subdepartmentCityMap[filters.subdepartment];
			if (targetCity) {
				activeFiltered = activeFiltered.filter((m) => m.city?.toLowerCase() === targetCity.toLowerCase());
				generalFiltered = generalFiltered.filter((m) => m.city?.toLowerCase() === targetCity.toLowerCase());
			}
		}

		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			activeFiltered = activeFiltered.filter((m) => m.fullName.toLowerCase().includes(searchLower) || m.email.toLowerCase().includes(searchLower) || m.profession?.toLowerCase().includes(searchLower));
			generalFiltered = generalFiltered.filter((m) => m.fullName.toLowerCase().includes(searchLower) || m.email.toLowerCase().includes(searchLower) || m.profession?.toLowerCase().includes(searchLower));
		}

		setFilteredExecutiveMembers(executiveFiltered);
		setFilteredActiveMembers(activeFiltered);
		setFilteredGeneralMembers(generalFiltered);
	}, [executiveMembers, regularMembers, filters]);

	useEffect(() => {
		applyFilters();
	}, [applyFilters]);

	const selectDepartment = (deptName) => {
		if (activeDepartment === deptName) {
			setActiveDepartment(null);
			setActiveSubdepartment(null);
			setFilters({ ...filters, department: null, subdepartment: null });
		} else {
			setActiveDepartment(deptName);
			setActiveSubdepartment(null);
			setFilters({ ...filters, department: deptName, subdepartment: null });
		}
	};

	const selectSubdepartment = (subdept) => {
		if (activeSubdepartment === subdept) {
			setActiveSubdepartment(null);
			setFilters({ ...filters, subdepartment: null });
		} else {
			setActiveSubdepartment(subdept);
			setFilters({ ...filters, subdepartment: subdept });
		}
	};

	const clearAllFilters = () => {
		setFilters({ department: null, subdepartment: null, search: "" });
		setActiveDepartment(null);
		setActiveSubdepartment(null);
	};

	const removeFilter = (filterType) => {
		if (filterType === "department") {
			setActiveDepartment(null);
			setActiveSubdepartment(null);
			setFilters({ ...filters, department: null, subdepartment: null });
		} else if (filterType === "subdepartment") {
			setActiveSubdepartment(null);
			setFilters({ ...filters, subdepartment: null });
		}
	};

	const getActiveDepartmentSubdepartments = () => {
		if (!activeDepartment) return [];
		const dept = departments.find((d) => d.name === activeDepartment);
		return dept?.subdepartments || [];
	};

	const hasActiveFilters = filters.department || filters.subdepartment || filters.search;

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent mb-4"></div>
					<p className="text-gray-700 text-lg">{t("loading")}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen pt-12">
			<SectionHeader heading={t("title")} subtitle={t("description")} className="mb-0" />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
				{/* Search and Filter Toggle */}
				<div className="mb-3">
					<div className="bg-white rounded-lg shadow-sm px-4 py-3">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							{!session && (
								<div className="order-first sm:order-none sm:justify-end flex">
									<Link href={`/${locale}/membership`} className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
										<UserPlus className="h-4 w-4" />
										<span>{t("become_a_member")}</span>
									</Link>
								</div>
							)}

							<div className="flex items-stretch sm:items-center gap-3 order-last sm:order-none">
								<div className="flex">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
										<input type="text" id="search" placeholder={t("search_placeholder")} className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
										{filters.search && (
											<button onClick={() => setFilters({ ...filters, search: "" })} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
												<X className="h-4 w-4" />
											</button>
										)}
									</div>
								</div>

								<div className="flex items-center gap-2">
									<button onClick={() => setShowMobileFilters(!showMobileFilters)} className="inline-flex items-center gap-2 px-3 py-2 bg-brand_primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
										<Filter className="h-4 w-4" />
										<span>{t("filters")}</span>
										{hasActiveFilters && <span className="bg-white text-brand_primary rounded-full px-2 py-0.5 text-xs font-semibold">{[filters.department, filters.subdepartment].filter(Boolean).length}</span>}
									</button>
									{hasActiveFilters && (
										<button onClick={clearAllFilters} className="text-sm text-brand_primary hover:text-blue-700 font-medium">
											{t("clear_all")}
										</button>
									)}
								</div>
							</div>
						</div>

						<div className="text-sm text-gray-700 sm:ml-auto m-2 text-left sm:text-right">
							<span className="text-brand_primary font-bold">{filteredExecutiveMembers.length}</span> {filteredExecutiveMembers.length === 1 ? t("executive_member") : t("executive_members")},<span className="text-brand_primary font-bold ml-2">{filteredActiveMembers.length}</span> {filteredActiveMembers.length === 1 ? t("active_member") : t("active_members")},<span className="text-brand_primary font-bold ml-2">{filteredGeneralMembers.length}</span> {filteredGeneralMembers.length === 1 ? t("general_member") : t("general_members")}
						</div>
					</div>
				</div>

				{/* Filters Panel */}
				<div className={`mb-3 ${showMobileFilters ? "block" : "hidden"}`}>
					<div className="bg-white rounded-lg shadow-sm px-4 py-3">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-md font-bold text-brand_primary">{t("filters")}</h3>
						</div>

						<div className="mb-4">
							<div className="flex items-center justify-between mb-3">
								<h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t("departments")}</h3>
							</div>
							<div className="relative">
								<div className="flex overflow-x-auto gap-2 sm:gap-3 pb-2 scroll-smooth hide-scrollbar snap-x snap-mandatory">
									{departments.map((dept) => (
										<button key={dept._id} onClick={() => selectDepartment(dept.name)} className={`px-3 py-2 rounded-lg border transition-all duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand whitespace-nowrap flex-shrink-0 snap-start ${activeDepartment === dept.name ? "border-brand bg-blue-50 text-brand_primary shadow-sm" : "bg-white border-gray-200 text-gray-700 hover:border-brand hover:bg-blue-50 hover:text-brand_primary"}`}>
											{dept.name}
										</button>
									))}
								</div>
								{departments.length > 3 && (
									<div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none flex items-center justify-end pr-2">
										<ChevronRight className="w-5 h-5 text-gray-400" />
									</div>
								)}
							</div>
						</div>

						{activeDepartment && getActiveDepartmentSubdepartments().length > 0 && (
							<div className="pt-4 border-t border-gray-200">
								<div className="flex items-center justify-between mb-3">
									<h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t("subdepartments")}</h3>
								</div>
								<div className="relative">
									<div className="flex overflow-x-auto gap-2 pb-2 scroll-smooth hide-scrollbar snap-x snap-mandatory">
										{getActiveDepartmentSubdepartments().map((subdept) => (
											<button key={subdept} onClick={() => selectSubdepartment(subdept)} className={`px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium whitespace-nowrap flex-shrink-0 snap-start ${activeSubdepartment === subdept ? "bg-blue-100 border-blue-400 text-brand_primary" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-brand_primary"}`}>
												{subdept}
											</button>
										))}
									</div>
									{getActiveDepartmentSubdepartments().length > 4 && (
										<div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none flex items-center justify-end pr-2">
											<ChevronRight className="w-5 h-5 text-gray-400" />
										</div>
									)}
								</div>
							</div>
						)}
					</div>

					<style jsx>{`
						.hide-scrollbar::-webkit-scrollbar {
							display: none;
						}
						.hide-scrollbar {
							-ms-overflow-style: none;
							scrollbar-width: none;
						}
					`}</style>
				</div>

				{/* Active Filter Pills */}
				{hasActiveFilters && (
					<div className="mb-4">
						<div className="bg-white rounded-lg shadow-sm px-4 py-3">
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-sm font-medium text-gray-700">{t("active_filters")}:</span>
								{filters.department && (
									<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-brand_primary rounded-full text-sm font-medium">
										{filters.department}
										<button onClick={() => removeFilter("department")} className="hover:text-blue-900 transition-colors" aria-label="Remove department filter">
											<X className="w-4 h-4" />
										</button>
									</span>
								)}
								{filters.subdepartment && (
									<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-brand_primary rounded-full text-sm font-medium">
										{filters.subdepartment}
										<button onClick={() => removeFilter("subdepartment")} className="hover:text-blue-900 transition-colors" aria-label="Remove subdepartment filter">
											<X className="w-4 h-4" />
										</button>
									</span>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Executive Members */}
				{filteredExecutiveMembers.length > 0 && (
					<div className="mb-8 md:mb-20 p-6 bg-brand_primary/5">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">{t("executive_members")}</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
							{filteredExecutiveMembers.map((member) => (
								<MemberCard key={member._id} name={member.name} email={member.email} phone={member.phone} imageUrl={member.imageUrl} avatarGradient="from-brand to-blue-600" badgeLabel={member.position} badgeClass="text-brand_primary" showContact={true} session={session} />
							))}
						</div>
					</div>
				)}

				{/* Active Members */}
				{filteredActiveMembers.length > 0 && (
					<div className="mb-8 md:mb-20 p-6">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">{t("active_members")}</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
							{filteredActiveMembers.map((member) => (
								<MemberCard key={member._id} name={member.fullName} email={member.email} phone={member.phone} imageUrl={member.profilePhoto} avatarGradient="from-green-500 to-green-600" badgeLabel={t("active_member")} badgeClass="text-green-600" showContact={true} session={session} />
							))}
						</div>
					</div>
				)}

				{/* General Members */}
				{filteredGeneralMembers.length > 0 && (
					<div className="mb-8">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">{t("general_members")}</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
							{filteredGeneralMembers.map((member) => (
								<MemberCard key={member._id} name={member.fullName} email={member.email} phone={member.phone} imageUrl={member.profilePhoto} avatarGradient="from-gray-500 to-gray-600" badgeLabel={t("general_member")} badgeClass="text-gray-600" showContact={true} session={session} />
							))}
						</div>
					</div>
				)}

				{/* No Results */}
				{filteredExecutiveMembers.length === 0 && filteredActiveMembers.length === 0 && filteredGeneralMembers.length === 0 && (
					<div className="bg-white rounded-lg shadow-sm p-12 text-center">
						<div className="max-w-md mx-auto">
							<svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">{t("no_results")}</h3>
							<p className="text-gray-600 mb-6">{t("adjust_filters")}</p>
							{hasActiveFilters && (
								<button onClick={clearAllFilters} className="px-6 py-2.5 bg-brand_primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
									{t("clear_all")}
								</button>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
