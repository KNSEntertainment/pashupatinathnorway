import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Banknote, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function DonateCTA() {
	const { toast } = useToast();

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast({
			title: "Copied!",
			description: `${label} has been copied to clipboard.`,
		});
	};

	return (
			<Card className="shadow-lg border-0">
				<CardHeader className="text-center bg-gradient-to-r from-brand_primary to-brand_secondary text-white rounded-t-lg">
					<CardTitle className="text-2xl font-bold">
						You can Donate to us
					</CardTitle>
				</CardHeader>
				<CardContent className="p-8">
					<div className="grid grid-cols-1 gap-8">
						{/* Bank Transfer Section */}
						<div className="space-y-6">
							<div className="flex items-center gap-3 mb-4">
								<Banknote className="w-8 h-8 text-blue-600" />
								<h3 className="text-xl font-semibold text-gray-900">
									Via Bank Transfer
								</h3>
							</div>

							<div className="space-y-4">
								<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
									<div className="flex items-center justify-between mb-2">
										<div>
											<p className="text-sm font-medium text-gray-600">
												For Temple Activities
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
													"Temple Activities Account Number"
												)
											}
											className="flex items-center gap-2"
										>
											<Copy className="w-4 h-4" />
											Copy
										</Button>
									</div>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
									<div className="flex items-center justify-between mb-2">
										<div>
											<p className="text-sm font-medium text-gray-600">
												For Temple Construction
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
													"Temple Construction Account Number"
												)
											}
											className="flex items-center gap-2"
										>
											<Copy className="w-4 h-4" />
											Copy
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
									Via Vipps
								</h3>
							</div>

							<div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
								<div className="space-y-4">
									<div>
										<p className="text-sm font-medium text-gray-600 mb-2">
											Vipps Number
										</p>
										<p className="text-3xl font-mono font-bold text-green-700">
											12200
										</p>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											copyToClipboard("12200", "Vipps Number")
										}
										className="flex items-center gap-2 mx-auto"
									>
										<Copy className="w-4 h-4" />
										Copy Vipps Number
									</Button>
									<div className="mt-4">
										<Badge variant="secondary" className="bg-green-100 text-green-800">
											Quick & Easy Donation
										</Badge>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Additional Info */}
					<div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
						<p className="text-sm text-blue-800 text-center">
							<strong>Thank you for your generous support!</strong> Your donations help us maintain 
							and grow our temple community, preserve our cultural heritage, and serve the Nepali 
							Hindu community in Norway.
						</p>
					</div>
				</CardContent>
			</Card>
	);
}
