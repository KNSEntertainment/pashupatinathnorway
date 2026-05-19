import mongoose from "mongoose";

const AboutUsSchema = new mongoose.Schema(
	{
		title: {
			type: mongoose.Schema.Types.Mixed,
			required: true,
			default: { en: '', no: '', ne: '' }
		},
		subtitle: {
			type: mongoose.Schema.Types.Mixed,
			required: true,
			default: { en: '', no: '', ne: '' }
		},
		about_description_1: {
			type: mongoose.Schema.Types.Mixed,
			required: true,
			default: { en: '', no: '', ne: '' }
		},
		about_description_2: {
			type: mongoose.Schema.Types.Mixed,
			required: true,
			default: { en: '', no: '', ne: '' }
		},
		more_about_us: {
			type: mongoose.Schema.Types.Mixed,
			required: true,
			default: { en: '', no: '', ne: '' }
		},
		image: {
			type: String,
			required: true,
		},
		stats: {
			active_members: {
				type: String,
				required: true,
				default: "200+"
			},
			months_active: {
				type: String,
				required: true,
				default: "6+"
			},
			active_members_label: {
				type: mongoose.Schema.Types.Mixed,
				required: true,
				default: { en: 'Active Members', no: 'Aktive Medlemmer', ne: 'सक्रिय सदस्यहरू' }
			},
			months_active_label: {
				type: mongoose.Schema.Types.Mixed,
				required: true,
				default: { en: 'Months Active', no: 'Måneder Aktiv', ne: 'महिना सक्रिय' }
			}
		}
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.AboutUs) {
  delete mongoose.models.AboutUs;
}
if (mongoose.modelSchemas && mongoose.modelSchemas.AboutUs) {
  delete mongoose.modelSchemas.AboutUs;
}

export default mongoose.model("AboutUs", AboutUsSchema);
