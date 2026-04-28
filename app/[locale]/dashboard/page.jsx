"use client";
import Link from "next/link";
import { useActiveMenu } from "@/context/ActiveMenuContext";
import { menuItems } from "@/components/DashboardMenuItems";

export default function DashboardGrid() {
	const { setActiveMenu } = useActiveMenu();

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
			{menuItems.map((item) => (
				<Link key={item.label} href={item.href} className="group relative overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105" onClick={() => setActiveMenu(item.id)}>
					<div className={`${item.color} p-6 h-auto`}>
						<div className="flex items-center justify-between">
							<div className="text-neutral-200">
								<h2 className="text-xl font-semibold mb-2">{item.label}</h2>
								<p className="text-neutral-200/80">View {item.label.toLowerCase()}</p>
							</div>
							<item.icon className="w-8 h-8 text-neutral-200 opacity-80 group-hover:opacity-100 transition-opacity" />
						</div>
					</div>
					<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
				</Link>
			))}
		</div>
	);
}
