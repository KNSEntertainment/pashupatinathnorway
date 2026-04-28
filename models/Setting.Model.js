import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema({
	name: { type: String, required: true },
	about: { type: String, required: false },
	address: { type: String, required: false },
	email: { type: String, required: true, unique: true },
	phone: String,
	mobile: String,
	facebook: String,
	youtube: String,
	instagram: String,
	linkedin: String,
	businessHoursMF: String,
	companyLogo: String,
});

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
