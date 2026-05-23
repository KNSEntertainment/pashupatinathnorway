// "use client";

// import { useState, useEffect } from "react";
// import { useTranslations, useLocale } from "next-intl";
// import { 
//   Clock,
//   Image as ImageIcon,
// } from "lucide-react";
// import SectionHeader from "./SectionHeader";

// interface Ritual {
//   _id: string;
//   title: string;
//   description: string;
//   imageUrl?: string;
//   features: string[];
//   timing?: string;
//   order: number;
//   isActive: boolean;
// }

// export default function Rituals() {
//   const t = useTranslations("rituals");
//   const locale = useLocale();
//   const [rituals, setRituals] = useState<Ritual[]>([]);
//   const [loading, setLoading] = useState(true);

  
//   useEffect(() => {
//     const fetchRituals = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`/api/rituals?locale=${locale}`);
//         if (response.ok) {
//           const data = await response.json();
//           setRituals(Array.isArray(data) ? data : []);
//         }
//       } catch (error) {
//         console.error('Error fetching rituals:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRituals();
//   }, [locale]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12">
//         <div className="container mx-auto px-4 max-w-7xl">
//           <header className="text-center mb-6 md:mb-8">
//             <SectionHeader heading={t("title")} subtitle={t("subtitle")} />
//           </header>
//           <div className="flex items-center justify-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand_primary"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-brand_primary/20 py-12">
//       <div className="container mx-auto px-4 max-w-7xl">
//         <header className="text-center mb-6 md:mb-8">
//           <SectionHeader heading={t("title")} subtitle={t("subtitle")} />
//         </header>
//       </div>

//       {/* Introduction Section */}
//       <div className="container mx-auto px-6">
  

//         {/* Rituals Grid */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
//           {rituals.map((ritual) => (
//             <div
//               key={ritual._id}
//               className="bg-light/20 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-orange-100 flex flex-col justify-between h-full"
//             >
//               <div className="p-6">
//                 <div className="w-12 h-12 bg-gradient-to-br from-brand_primary to-brand_secondary rounded-xl overflow-hidden mb-4 group-hover:scale-110 transition-transform">
//                   {ritual.imageUrl ? (
//                     <img
//                       src={ritual.imageUrl}
//                       alt={ritual.title}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center text-white">
//                       <ImageIcon className="w-6 h-6" />
//                     </div>
//                   )}
//                 </div>
//                 {ritual.timing && (
//                   <div className="flex items-center gap-2 text-sm w-fit text-gray-700 bg-brand_primary/20 px-3 py-1 rounded-full mb-4">
//                     <Clock className="w-4 h-4" />
//                     {ritual.timing}
//                   </div>
//                 )}
//                 <h3 className="text-xl font-bold text-gray-900 mb-3">{ritual.title}</h3>
//                 <p className="text-gray-600 mb-4">{ritual.description}</p>
                
//                 <div className="space-y-2">
//                   {ritual.features.slice(0, 2).map((feature, index) => (
//                     <div key={`${ritual._id}-feature-${index}`} className="flex items-center gap-2 text-sm text-gray-600">
//                       <div className="w-1.5 h-1.5 bg-brand_primary rounded-full"></div>
//                       {feature}
//                     </div>
//                   ))}
//                                   </div>
//               </div>
              
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import SectionHeader from "./SectionHeader";

interface Ritual {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
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
        console.error("Error fetching rituals:", error);
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

      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex flex-col gap-12 mb-16">
          {rituals.map((ritual, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={ritual._id}
                className={`flex flex-col md:flex-row items-stretch gap-0 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-orange-100 bg-light/20 ${
                  // On md+, alternate: even = image left, odd = image right
                  !isEven ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Image panel */}
                <div className="w-full md:w-2/5 min-h-48 md:min-h-0 bg-gradient-to-br from-brand_primary to-brand_secondary flex-shrink-0 overflow-hidden relative">
                  {ritual.imageUrl ? (
                    <Image
                      src={ritual.imageUrl}
                      alt={ritual.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 40vw, 30vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/60 min-h-48 md:min-h-full">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>

                {/* Content panel */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                  {ritual.timing && (
                    <div className="flex items-center gap-2 text-sm w-fit text-gray-700 bg-brand_primary/20 px-3 py-1 rounded-full mb-4">
                      <Clock className="w-4 h-4" />
                      {ritual.timing}
                    </div>
                  )}

                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                    {ritual.title}
                  </h3>
                  <p className="text-gray-600 mb-5 leading-relaxed">
                    {ritual.description}
                  </p>

                  <div className="space-y-2">
                    {ritual.features.slice(0, 2).map((feature, i) => (
                      <div
                        key={`${ritual._id}-feature-${i}`}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <div className="w-1.5 h-1.5 bg-brand_primary rounded-full flex-shrink-0"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}