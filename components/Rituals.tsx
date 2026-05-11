"use client";

import { useTranslations } from "next-intl";
import { 
  Building, 
  Flame, 
  Heart, 
  Star, 
  Clock,
  Sparkles,
} from "lucide-react";
import SectionHeader from "./SectionHeader";

interface Ritual {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  timing?: string;
}

export default function Rituals() {
  const t = useTranslations("rituals");

  const rituals: Ritual[] = [
    {
      id: "daily-puja",
      title: t("daily_puja_title"),
      description: t("daily_puja_description"),
      icon: <Building className="w-6 h-6" />,
      features: [
        t("daily_puja_feature_1"),
        t("daily_puja_feature_2"),
        t("daily_puja_feature_3")
      ],
      timing: t("daily_puja_timing")
    },
    {
      id: "rudrabhishek",
      title: t("rudrabhishek_title"),
      description: t("rudrabhishek_description"),
      icon: <Flame className="w-6 h-6" />,
      features: [
        t("rudrabhishek_feature_1"),
        t("rudrabhishek_feature_2"),
        t("rudrabhishek_feature_3")
      ],
      timing: t("rudrabhishek_timing")
    },
    {
      id: "satyanarayan",
      title: t("satyanarayan_title"),
      description: t("satyanarayan_description"),
      icon: <Heart className="w-6 h-6" />,
      features: [
        t("satyanarayan_feature_1"),
        t("satyanarayan_feature_2"),
        t("satyanarayan_feature_3")
      ],
      timing: t("satyanarayan_timing")
    },
    {
      id: "hawan",
      title: t("hawan_title"),
      description: t("hawan_description"),
      icon: <Sparkles className="w-6 h-6" />,
      features: [
        t("hawan_feature_1"),
        t("hawan_feature_2"),
        t("hawan_feature_3")
      ],
      timing: t("hawan_timing")
    },
    {
      id: "festivals",
      title: t("festivals_title"),
      description: t("festivals_description"),
      icon: <Star className="w-6 h-6" />,
      features: [
        t("festivals_feature_1"),
        t("festivals_feature_2"),
        t("festivals_feature_3"),
        t("festivals_feature_4"),
        t("festivals_feature_5")
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <header className="text-center mb-6 md:mb-8">
          <SectionHeader heading={t("title")} subtitle={t("subtitle")} />
        </header>
      </div>

      {/* Introduction Section */}
      <div className="container mx-auto px-6">
  

        {/* Rituals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {rituals.map((ritual) => (
            <div
              key={ritual.id}
              className="bg-light/20 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-orange-100 flex flex-col justify-between h-full"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-brand_primary to-brand_secondary rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {ritual.icon}
                </div>
                {ritual.timing && (
                  <div className="flex items-center gap-2 text-sm w-fit text-gray-700 bg-brand_primary/20 px-3 py-1 rounded-full mb-4">
                    <Clock className="w-4 h-4" />
                    {ritual.timing}
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{ritual.title}</h3>
                <p className="text-gray-600 mb-4">{ritual.description}</p>
                
                <div className="space-y-2">
                  {ritual.features.slice(0, 2).map((feature, index) => (
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
