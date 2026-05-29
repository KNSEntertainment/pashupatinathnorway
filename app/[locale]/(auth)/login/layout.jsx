import Header from "@/components/header/Header";

export default function UserLayout({ children }) {
	return (
		<div>
			<Header />
			<main className="-mt-24">{children}</main>
		</div>
	);
}
