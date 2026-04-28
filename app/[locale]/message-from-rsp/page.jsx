"use client";

import Image from "next/image";
import { Quote } from "lucide-react";

export default function WelcomeMessage() {
	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-48">
			{/* Section Header */}
			<div className="text-center mb-16">
				<h2 className="text-3xl font-bold text-gray-900 mb-4">
					स्वागत <span className="text-brand mt-1"> मन्तव्य</span>
				</h2>
				<div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto rounded-full"></div>
			</div>

			{/* Main Content */}
			<div className="bg-white rounded-3xl shadow-md overflow-hidden">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
					{/* Image Section */}
					<div className="relative h-64 sm:h-80 lg:h-auto min-h-[500px] bg-brand">
						<div className="absolute inset-0">
							<Image src="/Saroj.png" alt="Welcome Photo" fill className="object-cover" />
							<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
						</div>

						{/* Decorative Quote Icon */}
						<div className="absolute top-8 left-8 w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
							<Quote size={32} className="text-white" />
						</div>

						{/* Image Overlay Text */}
						{/* <div className="absolute bottom-8 left-8 right-8">
								<div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
									<p className="text-white font-semibold text-lg">सरोज थापा</p>
									<p className="text-blue-100 text-sm">संस्थापक संयोजक, प्रवास नेपाली सम्पर्क विभाग नर्वे</p>
								</div>
							</div> */}
					</div>

					{/* Letter Section */}
					<div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-light">
						<div className="space-y-4">
							{/* Greeting */}
							{/* <div>
									<h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">संस्थापक संयोजकको स्वागत मन्तव्य</h3>
								</div> */}

							{/* Letter Content */}
							<div className="space-y-4 text-gray-900 leading-relaxed text-lg">
								<p>प्रवास नेपाली सम्पर्क विभाग नर्वेको आधिकारिक वेबसाइटमा यहाँहरू सबैलाई हार्दिक स्वागत गर्दछु। प्रवास नेपाली सम्पर्क विभाग विदेशमा रहेका नेपालीहरूलाई विचार, सहभागिता र जिम्मेवारीको साझा मञ्चमा जोड्ने उद्देश्यले स्थापित गरिएको संस्था हो। प्रवासमा रहँदा पनि देशप्रतिको माया, लोकतान्त्रिक मूल्य र सकारात्मक परिवर्तनप्रतिको प्रतिबद्धता अझ सशक्त हुन्छ भन्ने विश्वासका साथ हामी अघि बढिरहेका छौँ।</p>
								<p>व्यावसायिक रूपमा म दिगो ऊर्जा, यान्त्रिक तथा HVAC प्रणालीसम्बन्धी पृष्ठभूमि बोकेको व्यक्ति हुँ, जहाँ अनुसन्धान, परामर्श र प्राविधिक विश्लेषणमा काम गर्ने अनुभव रहेको छ। यही संरचित सोच, तथ्यमा आधारित निर्णय र दीर्घकालीन दृष्टिकोणलाई प्रवास नेपाली सम्पर्क विभाग नर्वेको नेतृत्व र कार्यदिशामा उपयोग गर्ने मेरो प्रयास रहनेछ।</p>
								<p>नर्वेमा रहेका नेपाली समुदाय विविध पेशा, सीप र अनुभवले समृद्ध छ। यही विविधतालाई शक्ति बनाउँदै प्रवासबाट देशको समग्र विकास, सुशासन र जिम्मेवार नागरिक चेतनामा योगसहयोग पुर्‍याउनु हाम्रो साझा दायित्व हो। संवाद, सहकार्य र एकताको माध्यमबाट प्रवासको आवाजलाई सशक्त बनाउने दिशामा विभाग प्रतिबद्ध छ। यस अभियानमा जोडिनु भनेको केवल संगठनमा आबद्ध हुनु मात्र होइन, विचार, विवेक र जिम्मेवारीका साथ सकारात्मक परिवर्तनको यात्रामा सहभागी हुनु हो।</p>
								<p>यहाँहरूको सुझाव, सहभागिता र सहकार्यले यस विभागलाई अझ सबल र प्रभावकारी बनाउनेछ भन्नेमा म विश्वस्त छु।</p>

								<p className="font-medium text-gray-900">धन्यवाद।</p>
							</div>

							{/* Signature */}
							<div className="pt-6 border-t border-light">
								<div className="flex items-end gap-4">
									<div>
										<p className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "cursive" }}>
											सरोज थापा
										</p>
										<p className="text-sm text-gray-900 font-medium">संस्थापक संयोजक, प्रवास नेपाली सम्पर्क विभाग नर्वे</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
