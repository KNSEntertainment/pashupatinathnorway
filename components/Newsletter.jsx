"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function Newsletter() {
	const [email, setEmail] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const response = await fetch("/api/subscribers", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ subscriber: email }),
			});

			const result = await response.json();
			console.log("result", result);
			if (!response.ok) {
				throw new Error(result.error || "Failed to subscribe");
			}

			if (result.success) {
				setEmail("");
				toast.success("Thank you for subscribing!");
			}
		} catch (error) {
			toast.success("Sorry, try again!", error);
		}
	};

	return (
		<div>
			<motion.div className="lg:max-w-2xl max-w-sm md:mx-auto mt-6  md:text-center" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
				<form onSubmit={handleSubmit} className="md:mx-auto flex flex-1 flex-col md:flex-row gap-4">
					<Input
						type="email"
						placeholder="Enter your email"
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
							console.log(email);
						}}
						className="w-72 flex-grow text-lg font-bold text-gray-700"
						required
					/>
					<Button type="submit" variant="secondary" className="w-72 md:w-fit">
						Subscribe
					</Button>
				</form>
			</motion.div>
		</div>
	);
}
