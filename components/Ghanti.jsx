"use client";
import React from "react";
import Image from "next/image";

export default function Ghanti() {
	return (
		<div className="relative w-32 h-32 flex items-center justify-center">
			<div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-swing origin-top">
				<Image src="/ghanti.png" alt="Logo" width={48} height={48} className="object-contain" />
			</div>

			<style jsx>{`
				@keyframes swing {
					0%,
					100% {
						transform: rotate(0deg);
					}
					10%,
					30% {
						transform: rotate(45deg);
					}
					20%,
					40% {
						transform: rotate(-45deg);
					}
					50% {
						transform: rotate(0deg);
					}
				}

				.animate-swing {
					animation: swing 2s ease-in-out infinite;
					transform-origin: top center;
				}
			`}</style>
		</div>
	);
}
