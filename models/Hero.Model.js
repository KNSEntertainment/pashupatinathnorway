import mongoose from "mongoose";

const HeroSlideSchema = new mongoose.Schema({
	title: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		default: { en: '', no: '', ne: '' }
	},
	description: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		default: { en: '', no: '', ne: '' }
	},
	image: {
		type: String,
		required: true,
	},
	primaryLink: {
		type: String,
		required: true,
		trim: true,
	},
	primaryButton: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		default: { en: '', no: '', ne: '' }
	},
	secondaryLink: {
		type: String,
		required: true,
		trim: true,
	},
	secondaryButton: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		default: { en: '', no: '', ne: '' }
	},
	order: {
		type: Number,
		default: 0,
	},
	isActive: {
		type: Boolean,
		default: true,
	},
});

const HeroSchema = new mongoose.Schema(
	{
		slides: [HeroSlideSchema],
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.Hero) {
  delete mongoose.models.Hero;
}
if (mongoose.modelSchemas && mongoose.modelSchemas.Hero) {
  delete mongoose.modelSchemas.Hero;
}

export default mongoose.model("Hero", HeroSchema);
