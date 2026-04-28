import DonatePageClient from "./DONATE_CLIENT";


export const metadata = {
	title: "Donate - Pashupatinath Norway Temple",
	description: "Support Pashupatinath Norway Temple with your generous donation",
};

async function getActiveCauses(locale: string) {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/causes?status=active&featured=true&limit=6&locale=${locale}`, {
			cache: 'no-store'
		});
		const data = await response.json();
		return data.causes || [];
	} catch (error) {
		console.error("Error fetching causes:", error);
		return [];
	}
}

export default async function DonatePage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	const causes = await getActiveCauses(locale);

	return <DonatePageClient causes={causes} locale={locale} />;
}
