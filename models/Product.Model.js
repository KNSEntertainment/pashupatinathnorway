const mongoose = require('mongoose');

const LocalizedStringSchema = new mongoose.Schema({
	en: { type: String, required: true },
	no: { type: String },
	ne: { type: String }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
	name: {
		type: LocalizedStringSchema,
		required: true
	},
	description: {
		type: LocalizedStringSchema,
		required: true
	},
	price: {
		type: Number,
		required: true,
		min: 0
	},
	currency: {
		type: String,
		required: true,
		default: 'NOK'
	},
	category: {
		type: String,
		enum: ['product', 'service'],
		required: true
	},
	type: {
		type: String,
		required: true // e.g., "book", "puja", "consultation"
	},
	imageUrl: {
		type: String,
		required: true
	},
	images: [{
		type: String
	}],
	inStock: {
		type: Boolean,
		default: true
	},
	stockQuantity: {
		type: Number,
		min: 0
	},
	isDigital: {
		type: Boolean,
		default: false
	},
	downloadUrl: {
		type: String
	},
	features: [LocalizedStringSchema],
	specifications: {
		type: Map,
		of: LocalizedStringSchema
	},
	isActive: {
		type: Boolean,
		default: true
	},
	tags: [{
		type: String
	}]
}, {
	timestamps: true
});

// Index for better search performance
ProductSchema.index({ 'name.en': 'text', 'name.no': 'text', 'name.ne': 'text' });
ProductSchema.index({ category: 1, type: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isActive: 1 });

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
