"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building, Heart, Users, Sparkles } from "lucide-react";
import ActiveCauses from "@/components/ActiveCauses";

export default function WhyDonatePage() {
  const { locale } = useParams() as { locale: string };
  const t = useTranslations("donate");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <div className="mb-8">
        <Link href={`/${locale}/donate`}>
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t("back_to_donate") || "Back to Donate"}
          </Button>
        </Link>
      </div>

      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t("why_donate_page_title") || "Why Your Donation Matters"}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t("why_donate_page_description") || "Your generous contribution helps us build Norway's first Nepali Hindu temple and preserve our rich cultural heritage for future generations."}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Why Donate Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-brand to-blue-700 text-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {t("why_donate") || "Why Donate?"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-white/80 mt-1">👍</span>
                <span>{t("why_donate_1") || "Help build Norway's first Nepali Hindu temple - a sacred space for worship and community"}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white/80 mt-1">👍</span>
                <span>{t("why_donate_2") || "Preserve our rich cultural heritage and religious traditions for future generations"}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white/80 mt-1">👍</span>
                <span>{t("why_donate_3") || "Create a spiritual home where families can celebrate festivals and perform sacred rituals"}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white/80 mt-1">👍</span>
                <span>{t("why_donate_4") || "Strengthen our community bonds and provide religious guidance to Nepalis in Norway"}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white/80 mt-1">👍</span>
                <span>{t("why_donate_5") || "Ensure our children grow up connected to their roots and cultural identity"}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Impact Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {t("impact_title") || "Your Impact"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-brand_primary/10 flex items-center justify-center">
                    <Building className="w-6 h-6 text-brand_primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {t("temple_construction") || "Temple Construction"}
                  </h4>
                  <p className="text-gray-600 mt-1">
                    {t("temple_construction_desc") || "Build Norway's first Nepali Hindu temple - creating a sacred space for worship and spiritual growth"}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-success" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {t("cultural_preservation") || "Cultural Preservation"}
                  </h4>
                  <p className="text-gray-600 mt-1">
                    {t("cultural_preservation_desc") || "Preserve and celebrate our rich Nepali heritage through festivals, rituals, and traditions"}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {t("community_spiritual") || "Community & Spiritual Services"}
                  </h4>
                  <p className="text-gray-600 mt-1">
                    {t("community_spiritual_desc") || "Provide religious guidance, ceremonies, and spiritual support to our community"}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {t("future_generations") || "Future Generations"}
                  </h4>
                  <p className="text-gray-600 mt-1">
                    {t("future_generations_desc") || "Ensure our children grow up connected to their cultural roots and spiritual identity"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ActiveCauses locale={locale} />

      {/* Call to Action */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-brand_primary to-brand_secondary text-white text-center">
        <CardContent className="py-12">
          <h2 className="text-3xl font-bold mb-4">
            {t("ready_to_donate") || "Ready to Make a Difference?"}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t("ready_to_donate_desc") || "Join us in building Norway's first Nepali Hindu temple. Every contribution brings us closer to our goal."}
          </p>
          <Link href={`/${locale}/donate`}>
            <Button size="lg" className="bg-white text-gray-700 hover:bg-gray-100 font-bold px-8 py-3">
              {t("donate_now") || "Donate Now"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
