import mongoose from "mongoose";

const LocalizedString = {
	type: Map,
	of: String,
	trim: true,
};

const circularSchema = new mongoose.Schema(
	{
		slug: { type: String, required: true, unique: true },
		circularTitle: LocalizedString,
		circularDesc: LocalizedString,
		circularAuthor: LocalizedString,

		circularMainPicture: {
			type: String,
		},
		circularSecondPicture: {
			type: String,
		},

		publicationStatus: {
			type: String,
			enum: ["draft", "published", "archived"],
			default: "draft",
		},

		circularPublishedAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.Circular || mongoose.model("Circular", circularSchema);
