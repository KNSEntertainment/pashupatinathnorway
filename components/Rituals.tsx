"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { 
  Building, 
  Flame, 
  Heart, 
  Clock,
  Sparkles,
} from "lucide-react";
import SectionHeader from "./SectionHeader";

interface Ritual {
  _id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  timing?: string;
  order: number;
  isActive: boolean;
}

export default function Rituals() {
  const t = useTranslations("rituals");
  const locale = useLocale();
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(true);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Building":
        return <Building className="w-6 h-6" />;
      case "Flame":
        return <Flame className="w-6 h-6" />;
      case "Heart":
        return <Heart className="w-6 h-6" />;
      case "Sparkles":
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Building className="w-6 h-6" />;
    }
  };

  useEffect(() => {
    const fetchRituals = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/rituals?locale=${locale}`);
        if (response.ok) {
          const data = await response.json();
          setRituals(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching rituals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRituals();
  }, [locale]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12">
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
    <div className="min-h-screen bg-brand_primary/20 py-12">
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
              key={ritual._id}
              className="bg-light/20 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-orange-100 flex flex-col justify-between h-full"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-brand_primary to-brand_secondary rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {getIconComponent(ritual.icon)}
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
                    <div key={`${ritual._id}-feature-${index}`} className="flex items-center gap-2 text-sm text-gray-600">
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
