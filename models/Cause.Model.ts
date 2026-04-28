import mongoose from "mongoose";

const MultilingualSchema = new mongoose.Schema({
	en: { type: String, required: true },
	no: { type: String, required: true },
	ne: { type: String, required: true }
}, { _id: false });

const CauseSchema = new mongoose.Schema({
	title: {
		type: MultilingualSchema,
		required: true
	},
	description: {
		type: MultilingualSchema,
		required: true
	},
	category: {
		type: String,
		required: true,
		enum: ['health', 'education', 'emergency', 'infrastructure', 'community', 'other']
	},
	goalAmount: {
		type: Number,
		required: true,
		min: 0
	},
	currentAmount: {
		type: Number,
		default: 0,
		min: 0
	},
	status: {
		type: String,
		required: true,
		enum: ['active', 'completed', 'paused', 'cancelled'],
		default: 'active'
	},
	urgency: {
		type: String,
		required: true,
		enum: ['low', 'medium', 'high', 'critical'],
		default: 'medium'
	},
	image: {
		type: String,
		required: false
	},
	poster: {
		type: String,
		required: false
	},
	startDate: {
		type: Date,
		default: Date.now
	},
	endDate: {
		type: Date,
		required: false
	},
	featured: {
		type: Boolean,
		default: false
	},
	donationCount: {
		type: Number,
		default: 0
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	updatedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
}, {
	timestamps: true
});

// Virtual for progress percentage
CauseSchema.virtual('progressPercentage').get(function() {
	if (this.goalAmount <= 0) return 0;
	return Math.min((this.currentAmount / this.goalAmount) * 100, 100);
});

// Virtual for remaining amount
CauseSchema.virtual('remainingAmount').get(function() {
	return Math.max(this.goalAmount - this.currentAmount, 0);
});

// Indexes for better performance
CauseSchema.index({ status: 1, featured: -1 });
CauseSchema.index({ category: 1 });
CauseSchema.index({ urgency: -1 });
CauseSchema.index({ endDate: 1 });

// Ensure we don't delete the model if it already exists
export default mongoose.models.Cause || mongoose.model('Cause', CauseSchema);
