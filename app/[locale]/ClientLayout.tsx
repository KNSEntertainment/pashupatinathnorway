"use client";
import AuthProvider from "@/context/AuthProvider";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
	return <AuthProvider>{children}</AuthProvider>;
}
