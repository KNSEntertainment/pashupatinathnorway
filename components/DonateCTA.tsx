import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Banknote, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

export default function DonateCTA() {
	const { toast } = useToast();
	const t = useTranslations("donate");

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast({
			title: t("copied"),
			description: t("copy_description", { label }),
		});
	};

	return (
			<Card className="shadow-lg border-0">
				<CardHeader className="text-center bg-gray-900 text-white rounded-t-lg">
					<CardTitle className="text-2xl font-bold">
						{t("cta_title")}
					</CardTitle>
				</CardHeader>
				<CardContent className="bg-brand_primary p-8">
					<div className="grid grid-cols-1 gap-8">
						{/* Bank Transfer Section */}
						<div className="space-y-6">
							<div className="flex items-center gap-3 mb-4">
								<Banknote className="w-8 h-8 text-blue-600" />
								<h3 className="text-xl font-semibold text-gray-900">
									{t("bank_transfer")}
								</h3>
							</div>

							<div className="space-y-4">
								<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
									<div className="flex items-center justify-between mb-2">
										<div>
											<p className="text-sm font-medium text-gray-600">
												{t("for_temple_activities")}
											</p>
											<p className="text-lg font-mono font-semibold text-gray-900">
												1520.24.74176
											</p>
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												copyToClipboard(
													"1520.24.74176",
													t("temple_activities_account")
												)
											}
											className="flex items-center gap-2"
										>
											<Copy className="w-4 h-4" />
											{t("copy")}
										</Button>
									</div>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
									<div className="flex items-center justify-between mb-2">
										<div>
											<p className="text-sm font-medium text-gray-600">
												{t("for_temple_construction")}
											</p>
											<p className="text-lg font-mono font-semibold text-gray-900">
												1520.31.97613
											</p>
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												copyToClipboard(
													"1520.31.97613",
													t("temple_construction_account")
												)
											}
											className="flex items-center gap-2"
										>
											<Copy className="w-4 h-4" />
											{t("copy")}
										</Button>
									</div>
								</div>
							</div>
						</div>

						{/* Vipps Section */}
						<div className="space-y-6">
							<div className="flex items-center gap-3 mb-4">
								<Smartphone className="w-8 h-8 text-green-600" />
								<h3 className="text-xl font-semibold text-gray-900">
									{t("via_vipps")}
								</h3>
							</div>

							<div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
								<div className="space-y-4">
									<div>
										<p className="text-sm font-medium text-gray-600 mb-2">
											{t("vipps_number")}
										</p>
										<p className="text-3xl font-mono font-bold text-green-700">
											12200
										</p>
										
									</div>
									<div>
										<p>
											Donation (आर्थिक सहयोग)
										</p>
										<p>
											Pashupatinath Norway Temple
										</p>
									</div>
							
								</div>
							</div>
						</div>
					</div>

				
				</CardContent>
			</Card>
	);
}
