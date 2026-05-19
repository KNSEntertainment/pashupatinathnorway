"use client";

import { useActiveMenu } from "@/context/ActiveMenuContext";
import { useEffect } from "react";
import MissionVisionAdmin from "@/components/admin/MissionVisionAdmin";

export default function MissionVisionPage() {
	const { setActiveMenu } = useActiveMenu();

	useEffect(() => {
		setActiveMenu("mission-vision");
	}, [setActiveMenu]);

	return (
		<div className="p-6">
			<MissionVisionAdmin />
		</div>
	);
}
