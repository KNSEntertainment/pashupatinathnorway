import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Management from "@/components/Management";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('management');
  
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default function ManagementPage() {
  return <Management />;
}
