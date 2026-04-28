"use client";

import { Suspense } from "react";
import HeaderScrollWrapper from "@/components/header/HeaderScrollWrapper";
import TopBar from "@/components/header/TopBar";
import MainHeader from "@/components/header/MainHeader";

export default function Header() {
	return (
		<HeaderScrollWrapper>
			<Suspense fallback={null}>
				<TopBar />
			</Suspense>
			<Suspense fallback={null}>
				<MainHeader />
			</Suspense>
		</HeaderScrollWrapper>
	);
}
