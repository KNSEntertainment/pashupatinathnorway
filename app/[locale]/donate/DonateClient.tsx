"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import DonationForm from "@/components/DonationForm";
import DonateCTA from "@/components/DonateCTA";
import ScrollingDonorList from "@/components/ScrollingDonorList";
import { Heart, Building, Star } from "lucide-react";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";

interface Cause {
	_id: string;
	title: string;
	description: string;
	category: string;
	status: string;
	goalAmount: number;
	currentAmount: number;
	donationCount: number;
	featured: boolean;
	endDate?: string;
	urgency: string;
	poster?: string;
}

interface DonatePageClientProps {
	causes: Cause[];
	locale: string;
	translations?: Record<string, string>;
}

export default function DonatePageClient({ locale }: DonatePageClientProps) {
	const t = useTranslations("donate");
	const [totalAmount, setTotalAmount] = useState<number>(0);
	const [totalGoalAmount, setTotalGoalAmount] = useState<number>(0);
	const [totalDonations, setTotalDonations] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const [donors, setDonors] = useState<Array<{name: string; amount: number; isAnonymous: boolean; date: string}>>([]); // Added donors state

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch total donations
				const totalResponse = await fetch('/api/donations/total');
				if (totalResponse.ok) {
					const totalData = await totalResponse.json();
					setTotalAmount(totalData.totalAmount);
				}

				// Fetch total goals and donations for progress bar
				const goalsResponse = await fetch('/api/causes/total');
				if (goalsResponse.ok) {
					const goalsData = await goalsResponse.json();
					setTotalGoalAmount(goalsData.totalGoalAmount);
					setTotalDonations(goalsData.totalDonations);
				}

				// Fetch donors
				const donorsResponse = await fetch('/api/donations/donors?limit=10');
				if (donorsResponse.ok) {
					const donorsData = await donorsResponse.json();
					setDonors(donorsData.donors || []);
				}
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);
	return (
		<div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Hero Section */}
					<SectionHeader heading={t("hero_title")} subtitle={t("hero_description")} />
		
					{/* Total Donations Display with Auto-Scrolling Donors */}
			{/* ── Donation Impact Section ─────────────────────────────────────────── */}
<div className="relative my-12 mx-auto max-w-6xl bg-black">

  {/* Soft ambient glow behind the whole block */}
  <div
    className="pointer-events-none absolute -inset-8 opacity-30"

  />

  <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-0 overflow-hidden shadow-md">

    {/* ── LEFT: Total Donations (spans 3 cols) ─────────────────────── */}
    <div className="lg:col-span-3 flex flex-col items-center justify-center px-8 py-12 lg:py-16 text-center relative "
    >
     

      {/* Small label */}
      <p
        className="relative z-10 text-md md:text-lg font-semibold uppercase mb-3 text-gray-200"
      >
        ✦ &nbsp;{t("total_donations") || "Total Donations till now"}&nbsp; ✦
      </p>

      {/* Amount */}
      <div className="relative z-10 mb-6">
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <svg
              className="animate-spin h-10 w-10"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : (
          <span
            className="block font-black leading-none"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
              background: "linear-gradient(135deg, #FFD580 0%, #FF8C42 50%, #FFD580 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
            }}
          >
            {totalAmount.toLocaleString("nb-NO", {
              style: "currency",
              currency: "NOK",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        )}
      </div>

      {/* Donor count badge */}
      {!loading && totalDonations > 0 && (
        <p className="relative z-10 text-sm mb-8 text-gray-200">
          
          <span className="font-bold" >
            {totalDonations}
          </span>
          &nbsp;{t("generous_donors")}
        </p>
      )}

      {/* Progress bar */}
      {!loading && totalGoalAmount > 0 && (
        <div className="relative z-10 w-full max-w-sm">
          {/* Track */}
          <div className="h-2 rounded-full overflow-hidden bg-gray-600">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(100, (totalAmount / totalGoalAmount) * 100).toFixed(1)}%`,
                background: "linear-gradient(90deg, #FF8C42, #FFD580)",
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-200">
              {Math.min(100, Math.round((totalAmount / totalGoalAmount) * 100))} {t("of_goal")}
            </span>
            <span className="text-xs text-gray-200">
              {totalGoalAmount.toLocaleString("nb-NO", {
                style: "currency",
                currency: "NOK",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>
      )}
    </div>

    {/* ── RIGHT: Donor list (spans 2 cols) ─────────────────────────── */}
    <div
      className="lg:col-span-2 flex flex-col"
      style={{ background: "#FDF6EC" }}
    >
      {/* Header strip */}
      <div
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(181,69,27,0.12)" }}
      >
        <div className="flex items-center gap-2">
          {/* Pulse dot */}
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: "#B5451B" }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: "#B5451B" }}
            />
          </span>
          <h3
            className="text-sm font-bold tracking-wide uppercase"
            style={{ color: "#3B1200", letterSpacing: "0.1em" }}
          >
            {t("our_donors")}
          </h3>
        </div>
        <Link
          href={`/${locale}/donors`}
          className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
          style={{
            background: "rgba(181,69,27,0.1)",
            color: "#B5451B",
            border: "1px solid rgba(181,69,27,0.2)",
          }}
        >
          {t("view_all")}
        </Link>
      </div>

      {/* Scrolling list */}
      <div className="flex-1 overflow-hidden relative min-h-[260px]">
        {/* Top fade */}
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-8 z-10"
          style={{ background: "linear-gradient(to bottom, #FDF6EC, transparent)" }}
        />
        {/* Bottom fade */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 z-10"
          style={{ background: "linear-gradient(to top, #FDF6EC, transparent)" }}
        />

        <ScrollingDonorList donors={donors} />
      </div>

      {/* Footer strip */}
      <div
        className="px-6 py-3 border-t text-center"
        style={{ borderColor: "rgba(181,69,27,0.1)" }}
      >
        <p className="text-sm md:text-md" style={{ color: "rgba(59,18,0,0.4)" }}>
          {t("every_contribution_matters")}
        </p>
      </div>
    </div>

  </div>
</div>
{/* ── End Donation Impact Section ───────────────────────────────────────── */}
			
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
					{/* Donation Form */}
					<div className="lg:col-span-2">
						<DonationForm locale={locale} />
					</div>

					{/* Impact Section */}
					<div className="space-y-6">
						{/* Donate CTA Section */}
						<DonateCTA />
						
						{/* <DonorList /> */}
					<div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl py-8 ">
						<h3 className="text-2xl font-bold text-center mb-8 text-brand_secondary">
							{t("why_donate_title") || "Why Build Pashupatinath Temple in Norway?"}
						</h3>
						
						<div className="grid grid-cols-1 gap-2 mb-6">
							<div className="rounded-xl p-6">
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand_primary/20 to-brand_primary/10 flex items-center justify-center flex-shrink-0">
										<Building className="w-5 h-5 text-brand_secondary" />
									</div>
									<div>
										<h4 className="font-bold text-gray-900 mb-2">{t("spiritual_home") || "Spiritual Home"}</h4>
										<p className="text-sm text-gray-600">{t("spiritual_home_desc") || "Create a sacred space for Nepali Hindus in Norway to connect with their faith and traditions."}</p>
									</div>
								</div>
							</div>
							
							<div className="rounded-xl p-6">
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand_secondary/20 to-brand_secondary/10 flex items-center justify-center flex-shrink-0">
										<Heart className="w-5 h-5 text-brand_secondary" />
									</div>
									<div>
										<h4 className="font-bold text-gray-900 mb-2">{t("cultural_preservation") || "Cultural Heritage"}</h4>
										<p className="text-sm text-gray-600">{t("cultural_preservation_desc") || "Preserve and share our rich Nepali Hindu culture with future generations in Norway."}</p>
									</div>
								</div>
							</div>
							
							<div className="rounded-xl p-6">
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-400/10 flex items-center justify-center flex-shrink-0">
										<Star className="w-5 h-5 text-amber-600" />
									</div>
									<div>
										<h4 className="font-bold text-gray-900 mb-2">{t("community_center") || "Community Hub"}</h4>
										<p className="text-sm text-gray-600">{t("community_center_desc") || "Build a vibrant community center for festivals, education, and social gatherings."}</p>
									</div>
								</div>
							</div>
							
							{/* <div className="bg-white rounded-xl p-6">
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-green-400/10 flex items-center justify-center flex-shrink-0">
										<Users className="w-5 h-5 text-green-600" />
									</div>
									<div>
										<h4 className="font-bold text-gray-900 mb-2">{t("legacy_building") || "Build Our Legacy"}</h4>
										<p className="text-sm text-gray-600">{t("legacy_building_desc") || "Leave a lasting legacy for our children and the Nepali diaspora in Scandinavia."}</p>
									</div>
								</div>
							</div> */}
						</div>
						
						<div className="text-center">
							{/* <div className="bg-gradient-to-r from-brand_primary to-brand_secondary rounded-xl p-6 mb-6">
								<p className="text-white text-lg font-semibold mb-2">
									{t("temple_vision") || "Together, we can build the first Pashupatinath Temple in Norway - a beacon of faith and culture for generations to come."}
								</p>
							</div> */}
							
							<Link href={`/${locale}/donate/why-donate`} className="inline-flex items-center gap-2 bg-gradient-to-r from-brand_secondary to-brand_secondary_light hover:from-brand_secondary_light hover:to-brand_secondary text-white rounded-lg px-8 py-3 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]">
								{t("learn_more") || "Learn More About Our Vision"} →
							</Link>
						</div>
					</div>
			
						
						
					</div>
				</div>
			</div>
		</div>
		
	);
}
