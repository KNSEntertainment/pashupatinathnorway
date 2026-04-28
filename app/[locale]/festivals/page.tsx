import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Festivals from "@/components/Festivals";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('festivals');
  
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default function FestivalsPage() {
  return <Festivals />;
}
