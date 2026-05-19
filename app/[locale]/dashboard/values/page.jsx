"use client";

import { useActiveMenu } from "@/context/ActiveMenuContext";
import { useEffect } from "react";
import ValuesAdmin from "@/components/admin/ValuesAdmin";

export default function ValuesPage() {
	const { setActiveMenu } = useActiveMenu();

	useEffect(() => {
		setActiveMenu("values");
	}, [setActiveMenu]);

	return (
		<div className="p-6">
			<ValuesAdmin />
		</div>
	);
}
