import { getSettings } from "@/lib/data/settings";
import FooterClient from "./FooterClient";
import { normalizeDocs } from "@/lib/utils";

export default async function Footer() {
	const settings = await getSettings();
	const settingsNorm = normalizeDocs(settings);

	return <FooterClient settings={settingsNorm} />;
}
