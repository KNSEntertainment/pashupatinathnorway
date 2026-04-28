import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Name is required"],
		minlength: [2, "Name must be at least 2 characters long"],
	},

	email: {
		type: String,
		required: [true, "Email is required"],
		match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
	},

	message: {
		type: String,
		required: [true, "Message is required"],
		minlength: [10, "Message must be at least 10 characters long"],
	},

	createdAt: {
		type: Date,
		default: Date.now,
	},
});

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
