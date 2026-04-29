import localFont from "next/font/local";
import "./globals.css";
import Footer from "@/components/Footer";
import ClientLayout from "./ClientLayout";
import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/header/Header";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<CartProvider>
					<ClientLayout>
						<NextIntlClientProvider>
							<Header />
							<div className="mt-24 min-h-screen pt-10">{children}</div>
							<Footer />
						</NextIntlClientProvider>
					</ClientLayout>
					<Toaster />
				</CartProvider>
			</body>
		</html>
	);
}
