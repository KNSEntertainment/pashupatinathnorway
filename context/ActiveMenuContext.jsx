"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const ActiveMenuContext = createContext({
	activeMenu: "dashboard",
	setActiveMenu: (menu) => {},
});

export const useActiveMenu = () => useContext(ActiveMenuContext);

export const ActiveMenuProvider = ({ children }) => {
	const [activeMenu, setActiveMenu] = useState("dashboard");
	const pathname = usePathname();

	useEffect(() => {
		// Extract menu id from pathname
		// e.g. /dashboard/blogs => blogs, /dashboard => dashboard
		let menuId = "dashboard";
		if (pathname.startsWith("/en/dashboard")) {
			const parts = pathname.split("/").filter(Boolean); // removes empty
			// parts[0] === 'dashboard', parts[1] === menu id (if exists)
			menuId = parts[2] || "dashboard";
		}
		setActiveMenu(menuId);
	}, [pathname]);

	return <ActiveMenuContext.Provider value={{ activeMenu, setActiveMenu }}>{children}</ActiveMenuContext.Provider>;
};
