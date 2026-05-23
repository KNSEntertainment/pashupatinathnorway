// "use client";

// import { useState, useEffect } from "react";
// import { useTranslations, useLocale } from "next-intl";
// import { 
//   Clock,
//   Image as ImageIcon,
// } from "lucide-react";
// import SectionHeader from "./SectionHeader";

// interface Festival {
//   _id: string;
//   title: string;
//   description: string;
//   imageUrl?: string;
//   features: string[];
//   timing?: string;
//   highlight?: boolean;
//   order: number;
//   isActive: boolean;
// }

// export default function Festivals() {
//   const t = useTranslations("festivals");
//   const locale = useLocale();
//   const [festivals, setFestivals] = useState<Festival[]>([]);
//   const [loading, setLoading] = useState(true);

  
//   useEffect(() => {
//     const fetchFestivals = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`/api/festivals?locale=${locale}`);
//         const data = await response.json();
//         setFestivals(Array.isArray(data) ? data : []);
//       } catch (error) {
//         console.error('Error fetching festivals:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFestivals();
//   }, [locale]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-brand_secondary/20 py-12">
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
//     <div className="min-h-screen bg-brand_secondary/10 py-12">
//       <div className="container mx-auto px-4 max-w-7xl">
//         <header className="text-center mb-6 md:mb-8">
//           <SectionHeader heading={t("title")} subtitle={t("subtitle")} />
//         </header>
//       </div>

//       {/* Introduction Section */}
//       <div className="container mx-auto px-6">
   

//         {/* Festivals Grid */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
//           {festivals.map((festival) => (
//             <div
//               key={festival._id}
//               className="bg-light/20 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col justify-between h-full"
//             >
//               {festival.highlight && (
//                 <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 text-sm font-semibold">
//                   {t("featured_festival")}
//                 </div>
//               )}
//               <div className="p-6">
//                 <div className={`w-12 h-12 bg-gradient-to-br ${
//                   festival.highlight 
//                     ? 'from-purple-600 to-pink-600' 
//                     : 'from-brand_primary to-brand_secondary'
//                 } rounded-xl overflow-hidden mb-4 group-hover:scale-110 transition-transform`}>
//                   {festival.imageUrl ? (
//                     <img
//                       src={festival.imageUrl}
//                       alt={festival.title}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center text-white">
//                       <ImageIcon className="w-6 h-6" />
//                     </div>
//                   )}
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-900 mb-3">{festival.title}</h3>
//                 <p className="text-gray-600 mb-4">{festival.description}</p>
                
//                 {festival.timing && (
//                   <div className="flex items-center gap-2 text-sm w-fit text-gray-700 bg-brand_primary/20 px-3 py-1 rounded-full mb-4">
//                     <Clock className="w-4 h-4" />
//                     {festival.timing}
//                   </div>
//                 )}
                
//                 <div className="space-y-2">
//                   {festival.features.map((feature, index) => (
//                     <div key={`${festival._id}-feature-${index}`} className="flex items-center gap-2 text-sm text-gray-600">
//                       <div className="w-1.5 h-1.5 bg-brand_primary rounded-full"></div>
//                       {feature}
//                     </div>
//                   ))}
//                 </div>
//               </div>
              
//                           </div>
//           ))}
//         </div>

  
//       </div>

//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import SectionHeader from "./SectionHeader";

interface Festival {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  features: string[];
  timing?: string;
  highlight?: boolean;
  order: number;
  isActive: boolean;
}

// Warm temple palette — one accent per card, cycling
const ACCENTS = [
  { bg: "#B5451B", light: "#FDF0E8", dot: "#E8845A" }, // vermillion
  { bg: "#7B3F00", light: "#FBF0E4", dot: "#C47C3A" }, // deep saffron
  { bg: "#8B1A1A", light: "#FDF0F0", dot: "#D96B6B" }, // crimson
  { bg: "#4A5240", light: "#EFF2EB", dot: "#7A8C6E" }, // temple moss
];

function FestivalCard({
  festival,
  index,
  accent,
}: {
  festival: Festival;
  index: number;
  accent: (typeof ACCENTS)[0];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 120);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  // Alternate layout: even = image left, odd = image right (on large)
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(36px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
      className="group relative"
    >
      {/* Featured ribbon */}
      {festival.highlight && (
        <div
          className="absolute -top-3 left-8 z-10 px-4 py-1 text-xs font-bold tracking-widest uppercase text-white rounded-full shadow-lg"
          style={{ background: accent.bg, letterSpacing: "0.15em" }}
        >
          ✦ Featured
        </div>
      )}

      <div
        className={`flex flex-col ${
          isEven ? "lg:flex-row" : "lg:flex-row-reverse"
        } rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-500`}
        style={{ background: "#FFFBF5" }}
      >
        {/* Image panel */}
        <div
          className="relative w-full lg:w-2/5 min-h-[220px] lg:min-h-[300px] overflow-hidden flex-shrink-0"
          style={{ background: accent.bg }}
        >
          {festival.imageUrl ? (
            <Image
              src={festival.imageUrl}
              alt={festival.title}
              fill
              className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
            />
          ) : (
            // Decorative placeholder — mandala-like rings
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="absolute w-48 h-48 rounded-full border opacity-20"
                style={{ borderColor: accent.light }}
              />
              <div
                className="absolute w-32 h-32 rounded-full border opacity-30"
                style={{ borderColor: accent.light }}
              />
              <div
                className="absolute w-16 h-16 rounded-full border opacity-40"
                style={{ borderColor: accent.light }}
              />
              <ImageIcon className="w-10 h-10 opacity-40" style={{ color: accent.light }} />
            </div>
          )}

          {/* Diagonal colour bleed into content side */}
          <div
            className={`absolute inset-y-0 ${isEven ? "right-0" : "left-0"} w-12 hidden lg:block`}
            style={{
              background: `linear-gradient(${isEven ? "to right" : "to left"}, transparent, #FFFBF5)`,
            }}
          />

          {/* Index number watermark */}
          <span
            className="absolute bottom-3 right-4 font-black text-6xl leading-none select-none pointer-events-none"
            style={{ color: "rgba(255,255,255,0.15)", fontFamily: "Georgia, serif" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Content panel */}
        <div className="flex-1 p-7 lg:p-9 flex flex-col justify-center gap-4">
          {/* Title */}
          <h3
            className="text-2xl lg:text-3xl font-black leading-tight text-gray-900"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {festival.title}
          </h3>

          {/* Timing pill */}
          {festival.timing && (
            <div className="flex items-center gap-2 w-fit">
              <div className="w-2 h-2 rounded-full" style={{ background: accent.bg }} />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: accent.bg }}
              >
                {festival.timing}
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="h-px w-12" style={{ background: accent.bg, opacity: 0.4 }} />

          {/* Description */}
          <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
            {festival.description}
          </p>

          {/* Features */}
          {festival.features.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-1">
              {festival.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: accent.dot }}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Festivals() {
  const t = useTranslations("festivals");
  const locale = useLocale();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/festivals?locale=${locale}`);
        const data = await response.json();
        setFestivals(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching festivals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFestivals();
  }, [locale]);

  return (
    <section
      className="min-h-screen py-16 lg:py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #FDF6EC 0%, #FBF0E4 50%, #F9EDE6 100%)" }}
    >
      {/* Background texture dots */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #7B3F00 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Decorative large circle top-right */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #B5451B, transparent 70%)" }}
      />

      <div className="relative container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-14">
          <SectionHeader heading={t("title")} subtitle={t("subtitle")} />
          {/* Decorative rule */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-16 bg-amber-700 opacity-30" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-700 opacity-50" />
            <div className="h-px w-16 bg-amber-700 opacity-30" />
          </div>
        </header>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl animate-pulse"
                style={{ background: "rgba(181,69,27,0.08)" }}
              />
            ))}
          </div>
        )}

        {/* Festival list */}
        {!loading && (
          <div className="space-y-10 lg:space-y-14">
            {festivals.map((festival, index) => (
              <FestivalCard
                key={festival._id}
                festival={festival}
                index={index}
                accent={ACCENTS[index % ACCENTS.length]}
              />
            ))}

            {festivals.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No festivals found.</p>
              </div>
            )}
          </div>
        )}

        {/* Bottom ornament */}
        {!loading && festivals.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-16 opacity-30">
            <div className="h-px w-24 bg-amber-800" />
            <span className="text-amber-800 text-lg">✦</span>
            <div className="h-px w-24 bg-amber-800" />
          </div>
        )}
      </div>
    </section>
  );
}