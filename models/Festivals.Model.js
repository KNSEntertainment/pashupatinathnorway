import mongoose from "mongoose";

const FestivalsSchema = new mongoose.Schema(
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
		highlight: {
			type: Boolean,
			default: false
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
if (mongoose.models.Festivals) {
  delete mongoose.models.Festivals;
}
if (mongoose.modelSchemas && mongoose.modelSchemas.Festivals) {
  delete mongoose.modelSchemas.Festivals;
}

export default mongoose.model("Festivals", FestivalsSchema);
