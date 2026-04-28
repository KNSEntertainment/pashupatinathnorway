"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { 
  Calendar, 
  Sparkles, 
  Heart, 
  Star, 
  Users,
  Clock,
  Music,
  Trophy,
  PartyPopper,
  Mic
} from "lucide-react";

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
    },
    {
      id: "special-programs",
      title: t("special_programs_title"),
      description: t("special_programs_description"),
      icon: <Mic className="w-6 h-6" />,
      features: [
        t("special_programs_feature_1"),
        t("special_programs_feature_2"),
        t("special_programs_feature_3")
      ],
      timing: t("special_programs_timing")
    }
  ];

  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand_primary to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-6 py-20 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("title")}</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed text-white/90">
            {t("subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Music className="w-4 h-4" />
              <span className="text-sm">{t("cultural_celebrations")}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Users className="w-4 h-4" />
              <span className="text-sm">{t("community_gatherings")}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Trophy className="w-4 h-4" />
              <span className="text-sm">{t("spiritual_events")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t("intro_title")}</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {t("intro_description")}
          </p>
        </div>

        {/* Festivals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {festivals.map((festival) => (
            <div
              key={festival.id}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer border-2 ${
                festival.highlight ? 'border-purple-200 ring-2 ring-purple-100' : 'border-purple-50'
              }`}
              onClick={() => setSelectedFestival(festival)}
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
                  <div className="flex items-center gap-2 text-sm text-purple-600 font-medium mb-4">
                    <Clock className="w-4 h-4" />
                    {festival.timing}
                  </div>
                )}
                
                <div className="space-y-2">
                  {festival.features.slice(0, 2).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                  {festival.features.length > 2 && (
                    <div className="text-sm text-purple-600 font-medium">
                      +{festival.features.length - 2} {t("more_features")}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 text-center">
                <span className="text-purple-600 font-medium">{t("learn_more")}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">{t("cta_title")}</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            {t("cta_description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              {t("upcoming_events")}
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
              {t("join_celebration")}
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Selected Festival */}
      {selectedFestival && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
          onClick={() => setSelectedFestival(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${
                    selectedFestival.highlight 
                      ? 'from-purple-600 to-pink-600' 
                      : 'from-brand_primary to-brand_secondary'
                  } rounded-xl flex items-center justify-center text-white`}>
                    {selectedFestival.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedFestival.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedFestival(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-lg text-gray-700 mb-6">{selectedFestival.description}</p>
              
              {selectedFestival.timing && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-purple-600 font-medium mb-2">
                    <Clock className="w-5 h-5" />
                    {t("timing")}
                  </div>
                  <p className="text-gray-700">{selectedFestival.timing}</p>
                </div>
              )}
              
              <div className="space-y-3 mb-8">
                <h4 className="font-semibold text-gray-900 mb-3">{t("key_highlights")}</h4>
                {selectedFestival.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{feature}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4">
                <button className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  {t("register_now")}
                </button>
                <button className="flex-1 border border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
                  {t("learn_more")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
