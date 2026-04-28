import Link from "next/link";

interface ViewAllButtonProps {
	href: string;
	label: string;
	className?: string;
}

export default function ViewAllButton({ href, label, className = "" }: ViewAllButtonProps) {
	return (
		<Link
			href={href}
			className={`group inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-brand/30 bg-white/70 backdrop-blur-sm text-brand font-semibold text-sm shadow-sm transition-all duration-300 hover:border-brand hover:shadow-lg hover:-translate-y-0.5 ${className}`}
		>
			<span className="relative">
				{label}
				<span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-brand transition-all duration-300 group-hover:w-full" />
			</span>
			<span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand text-white transition-transform duration-300 group-hover:translate-x-0.5">
				<svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
					<path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
				</svg>
			</span>
		</Link>
	);
}
