"use client";

import { useState } from "react";
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

  const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);

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
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer border border-orange-100 flex flex-col justify-between h-full"
              onClick={() => setSelectedRitual(ritual)}
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-brand_primary to-brand_secondary rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {ritual.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{ritual.title}</h3>
                <p className="text-gray-600 mb-4">{ritual.description}</p>
                
                {ritual.timing && (
                  <div className="flex items-center gap-2 text-sm w-fit text-gray-700 bg-brand_primary/20 px-3 py-1 rounded-full mb-4">
                    <Clock className="w-4 h-4" />
                    {ritual.timing}
                  </div>
                )}
                
                <div className="space-y-2">
                  {ritual.features.slice(0, 2).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-brand_primary rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                  {ritual.features.length > 2 && (
                    <div className="text-sm text-brand_secondary">
                      +{ritual.features.length - 2} {t("more_features")}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-brand_primary px-6 py-3 text-center">
                <span className="text-gray-700 font-medium">{t("learn_more")}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-brand_primary to-brand_secondary rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">{t("cta_title")}</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            {t("cta_description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              {t("book_ritual")}
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-700 transition-colors">
              {t("contact_priest")}
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Selected Ritual */}
      {selectedRitual && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
          onClick={() => setSelectedRitual(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand_primary to-brand_secondary rounded-xl flex items-center justify-center text-white">
                    {selectedRitual.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedRitual.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedRitual(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-lg text-gray-700 mb-6">{selectedRitual.description}</p>
              
              {selectedRitual.timing && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-brand_secondary font-medium mb-2">
                    <Clock className="w-5 h-5" />
                    {t("timing")}
                  </div>
                  <p className="text-gray-700">{selectedRitual.timing}</p>
                </div>
              )}
              
              <div className="space-y-3 mb-8">
                <h4 className="font-semibold text-gray-900 mb-3">{t("key_features")}</h4>
                {selectedRitual.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand_secondary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{feature}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4">
                <button className="flex-1 bg-brand_secondary text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand_secondary/90 transition-colors">
                  {t("book_now")}
                </button>
                <button className="flex-1 border border-brand_secondary text-brand_secondary px-6 py-3 rounded-lg font-semibold hover:bg-brand_secondary/10 transition-colors">
                  {t("inquire")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
