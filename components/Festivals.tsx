"use client";

import { useTranslations } from "next-intl";
import { 
  Sparkles, 
  Heart, 
  Star, 
  Clock,
  PartyPopper,
} from "lucide-react";
import SectionHeader from "./SectionHeader";

interface Festival {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  timing?: string;
  highlight?: boolean;
}

export default function Festivals() {
  const t = useTranslations("festivals");

  const festivals: Festival[] = [
    {
      id: "maha-shivaratri",
      title: t("maha_shivaratri_title"),
      description: t("maha_shivaratri_description"),
      icon: <Star className="w-6 h-6" />,
      features: [
        t("maha_shivaratri_feature_1"),
        t("maha_shivaratri_feature_2"),
        t("maha_shivaratri_feature_3")
      ],
      timing: t("maha_shivaratri_timing"),
      highlight: true
    },
    {
      id: "teej",
      title: t("teej_title"),
      description: t("teej_description"),
      icon: <Heart className="w-6 h-6" />,
      features: [
        t("teej_feature_1"),
        t("teej_feature_2"),
        t("teej_feature_3")
      ],
      timing: t("teej_timing")
    },
    {
      id: "dashain-tihar",
      title: t("dashain_tihar_title"),
      description: t("dashain_tihar_description"),
      icon: <Sparkles className="w-6 h-6" />,
      features: [
        t("dashain_tihar_feature_1"),
        t("dashain_tihar_feature_2"),
        t("dashain_tihar_feature_3")
      ],
      timing: t("dashain_tihar_timing")
    },
    {
      id: "holi",
      title: t("holi_title"),
      description: t("holi_description"),
      icon: <PartyPopper className="w-6 h-6" />,
      features: [
        t("holi_feature_1"),
        t("holi_feature_2"),
        t("holi_feature_3")
      ],
      timing: t("holi_timing")
    }
  ];


  return (
    <div className="min-h-screen bg-brand_secondary/20 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <header className="text-center mb-6 md:mb-8">
          <SectionHeader heading={t("title")} subtitle={t("subtitle")} />
        </header>
      </div>

      {/* Introduction Section */}
      <div className="container mx-auto px-6">
   

        {/* Festivals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {festivals.map((festival) => (
            <div
              key={festival.id}
              className="bg-light/20 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col justify-between h-full"
            >
              {festival.highlight && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 text-sm font-semibold">
                  {t("featured_festival")}
                </div>
              )}
              <div className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${
                  festival.highlight 
                    ? 'from-purple-600 to-pink-600' 
                    : 'from-brand_primary to-brand_secondary'
                } rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {festival.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{festival.title}</h3>
                <p className="text-gray-600 mb-4">{festival.description}</p>
                
                {festival.timing && (
                  <div className="flex items-center gap-2 text-sm w-fit text-gray-700 bg-brand_primary/20 px-3 py-1 rounded-full mb-4">
                    <Clock className="w-4 h-4" />
                    {festival.timing}
                  </div>
                )}
                
                <div className="space-y-2">
                  {festival.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-brand_primary rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              
                          </div>
          ))}
        </div>

  
      </div>

    </div>
  );
}
