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
			<head>
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
				<link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<CartProvider>
					<ClientLayout>
						<NextIntlClientProvider>
							<Header />
							<div className="mt-16 md:mt-24 min-h-screen pt-10">{children}</div>
							<Footer />
						</NextIntlClientProvider>
					</ClientLayout>
					<Toaster />
				</CartProvider>
			</body>
		</html>
	);
}
