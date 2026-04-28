import mongoose from "mongoose";

const LoginSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	time: {
		type: String,
	},
});

const Login = mongoose.models.Login || mongoose.model("Login", LoginSchema);

export default Login;
