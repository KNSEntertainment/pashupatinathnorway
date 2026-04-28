import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Rituals from "@/components/Rituals";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('rituals');
  
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default function RitualsPage() {
  return <Rituals />;
}
