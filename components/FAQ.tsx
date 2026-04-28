"use client";

import React, { useState } from "react";
import { ArrowBigDown } from "lucide-react";

type FAQItem = {
	question: string;
	answer: string;
};

const faqData: FAQItem[] = [
	{
		question: "What is React?",
		answer: "React is a popular JavaScript library for building user interfaces, particularly single-page applications. It's used for handling the view layer in web and mobile apps.",
	},
	{
		question: "What is Tailwind CSS?",
		answer: "Tailwind CSS is a utility-first CSS framework that allows you to build custom designs without ever leaving your HTML. It provides low-level utility classes that let you build completely custom designs.",
	},
	{
		question: "How do React and Tailwind work together?",
		answer: "React and Tailwind CSS can be used together to create powerful, flexible user interfaces. React handles the functionality and component structure, while Tailwind provides utility classes for styling those components quickly and consistently.",
	},
	{
		question: "Is this FAQ component reusable?",
		answer: "Yes! This FAQ component is designed to be reusable. You can easily modify the faqData array to include your own questions and answers, and the component will render them automatically.",
	},
];

const FAQItem: React.FC<{ item: FAQItem }> = ({ item }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="border-b border-light py-4">
			<button className="flex w-full justify-between items-center text-left" onClick={() => setIsOpen(!isOpen)}>
				<span className="text-lg font-medium text-gray-900">{item.question}</span>
				<ArrowBigDown className={`w-5 h-5 text-gray-900 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`} />
			</button>
			{isOpen && (
				<div className="mt-2 pr-12">
					<p className="text-base text-gray-900">{item.answer}</p>
				</div>
			)}
		</div>
	);
};

const FAQ: React.FC = () => {
	return (
		<div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
			<h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Frequently Asked Questions</h2>
			<div className="mt-6 border-t border-light pt-10">
				{faqData.map((item, index) => (
					<FAQItem key={index} item={item} />
				))}
			</div>
		</div>
	);
};

export default FAQ;
