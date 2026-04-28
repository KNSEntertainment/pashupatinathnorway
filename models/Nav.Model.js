import mongoose from "mongoose";

const NavItemSchema = new mongoose.Schema({
	title: { type: String, required: true },
	href: { type: String, required: false },
	hasHref: { type: Boolean, default: true },
	pageTitle: { type: String },
	topic: { type: String },
	description: { type: String },
	image: { type: String },
	content: { type: String },
	dropdownItems: [
		{
			title: { type: String, required: true },
			href: { type: String, required: true },
		},
	],
	order: { type: Number, default: 0 },
});

const Nav = mongoose.models.Nav || mongoose.model("Nav", NavItemSchema);

export default Nav;
