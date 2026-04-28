import localFont from "next/font/local";
import "./globals.css";
import Footer from "@/components/Footer";
import ClientLayout from "./ClientLayout";
import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/header/Header";

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
				<ClientLayout>
					<NextIntlClientProvider>
						<Header />
						<div className="container mx-auto mt-24 md:mt-[140px] md:mb-12 min-h-screen">{children}</div>
						<Footer />
					</NextIntlClientProvider>
				</ClientLayout>
			</body>
		</html>
	);
}
