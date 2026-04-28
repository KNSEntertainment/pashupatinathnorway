import Ghanti from "@/components/Ghanti";

export default function GlobalLoading() {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="relative">
				{/* Outer Circle - Clockwise */}
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="w-24 h-24 rounded-full border-2 border-transparent border-r-brand animate-spin-slow"></div>
				</div>

				{/* Inner Circle - Counter-clockwise */}
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="w-20 h-20 rounded-full border-2 border-transparent border-b-brand animate-spin-reverse"></div>
				</div>

				{/* Logo Container */}
				<Ghanti />
			</div>
		</div>
	);
}
