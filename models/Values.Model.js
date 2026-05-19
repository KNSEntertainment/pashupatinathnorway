import mongoose from "mongoose";

const ValueItemSchema = new mongoose.Schema({
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
		default: "Landmark"
	},
	order: {
		type: Number,
		default: 0
	}
});

const ValuesSchema = new mongoose.Schema(
	{
		title: {
			type: mongoose.Schema.Types.Mixed,
			required: true,
			default: { en: 'Our Values', no: 'Våre Verdier', ne: 'हाम्रा मूल्यहरू' }
		},
		values: [ValueItemSchema]
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.Values) {
  delete mongoose.models.Values;
}
if (mongoose.modelSchemas && mongoose.modelSchemas.Values) {
  delete mongoose.modelSchemas.Values;
}

export default mongoose.model("Values", ValuesSchema);
