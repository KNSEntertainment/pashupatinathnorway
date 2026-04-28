import React from "react";

interface SectionHeaderProps {
	heading: string;
	className?: string;
	subtitle?: string;
	seeAllLink?: string;
	seeAllText?: string;
}

export default function SectionHeader({ 
	heading, 
	className = "", 
	subtitle, 
	
}: SectionHeaderProps) {
	return (
		<div className={`text-center mb-8 md:mb-20 ${className}` }>
			<div className="inline-flex items-center gap-3 mb-4 md:mb-6">
				<div className="w-12 h-px bg-gradient-to-r from-transparent via-brand to-transparent"></div>
				<span className="text-sm font-medium text-brand tracking-wider uppercase">******</span>
				<div className="w-12 h-px bg-gradient-to-r from-transparent via-brand to-transparent"></div>
			</div>
			<h1 className="text-3xl md:text-5xl font-light text-gray-900 mb-4 md:mb-6 tracking-tight">
				{heading}
			</h1>
			{subtitle && (
				<p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
					{subtitle}
				</p>
			)}
		</div>
	);
}
