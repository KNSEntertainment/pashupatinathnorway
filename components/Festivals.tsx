"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { 
  Sparkles, 
  Heart, 
  Star, 
  Clock,
  PartyPopper,
} from "lucide-react";
import SectionHeader from "./SectionHeader";

interface Festival {
  _id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  timing?: string;
  highlight?: boolean;
  order: number;
  isActive: boolean;
}

export default function Festivals() {
  const t = useTranslations("festivals");
  const locale = useLocale();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Star":
        return <Star className="w-6 h-6" />;
      case "Heart":
        return <Heart className="w-6 h-6" />;
      case "Sparkles":
        return <Sparkles className="w-6 h-6" />;
      case "PartyPopper":
        return <PartyPopper className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/festivals?locale=${locale}`);
        const data = await response.json();
        setFestivals(data.festivals || []);
      } catch (error) {
        console.error('Error fetching festivals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFestivals();
  }, [locale]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand_secondary/20 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <header className="text-center mb-6 md:mb-8">
            <SectionHeader heading={t("title")} subtitle={t("subtitle")} />
          </header>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand_primary"></div>
          </div>
        </div>
      </div>
    );
  }


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
              key={festival._id}
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
                  {getIconComponent(festival.icon)}
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
                    <div key={`${festival._id}-feature-${index}`} className="flex items-center gap-2 text-sm text-gray-600">
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
