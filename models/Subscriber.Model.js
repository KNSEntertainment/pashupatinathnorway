// models/Subscriber.js
import mongoose from "mongoose";

const SubscriberSchema = new mongoose.Schema(
	{
		subscriber: {
			type: String,
			required: [true, "Please provide an email address"],
			unique: true,
			trim: true,
			lowercase: true,
			validate: {
				validator: function (v) {
					return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
				},
				message: (props) => `${props.value} is not a valid email address!`,
			},
		},
	},
	{ timestamps: true }
);

export default mongoose.models.Subscriber || mongoose.model("Subscriber", SubscriberSchema);
