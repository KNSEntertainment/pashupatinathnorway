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
		imageUrl: {
			type: String,
			required: false
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
		},
		isDeleted: {
			type: Boolean,
			default: false
		},
		deletedAt: {
			type: Date,
			default: null
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
