import mongoose from "mongoose";

const MissionVisionSchema = new mongoose.Schema(
	{
		mission: {
			title: {
				type: mongoose.Schema.Types.Mixed,
				required: true,
				default: { en: '', no: '', ne: '' }
			},
			description: {
				type: mongoose.Schema.Types.Mixed,
				required: true,
				default: { en: '', no: '', ne: '' }
			}
		},
		vision: {
			title: {
				type: mongoose.Schema.Types.Mixed,
				required: true,
				default: { en: '', no: '', ne: '' }
			},
			description: {
				type: mongoose.Schema.Types.Mixed,
				required: true,
				default: { en: '', no: '', ne: '' }
			}
		}
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.MissionVision) {
  delete mongoose.models.MissionVision;
}
if (mongoose.modelSchemas && mongoose.modelSchemas.MissionVision) {
  delete mongoose.modelSchemas.MissionVision;
}

export default mongoose.model("MissionVision", MissionVisionSchema);
