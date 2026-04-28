import Header from "@/components/header/Header";
import Footer from "@/components/Footer";

export default function UserLayout({ children }) {
	return (
		<div>
			<Header />
			<main className="-mt-24">{children}</main>
			<Footer />
		</div>
	);
}
