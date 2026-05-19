import mongoose from "mongoose";

const RitualsSchema = new mongoose.Schema(
	{
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
		icon: {
			type: String,
			required: true,
			default: "Building"
		},
		features: {
			type: mongoose.Schema.Types.Mixed,
			required: true,
			default: { en: [], no: [], ne: [] }
		},
		timing: {
			type: mongoose.Schema.Types.Mixed,
			required: false,
			default: { en: '', no: '', ne: '' }
		},
		order: {
			type: Number,
			default: 0
		},
		isActive: {
			type: Boolean,
			default: true
		}
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.Rituals) {
  delete mongoose.models.Rituals;
}
if (mongoose.modelSchemas && mongoose.modelSchemas.Rituals) {
  delete mongoose.modelSchemas.Rituals;
}

export default mongoose.model("Rituals", RitualsSchema);
