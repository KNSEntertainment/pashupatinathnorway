const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
		required: true
	},
	quantity: {
		type: Number,
		required: true,
		min: 1
	},
	variant: {
		type: String
	},
	price: {
		type: Number,
		required: true
	},
	productSnapshot: {
		name: {
			en: { type: String, required: true },
			no: { type: String },
			ne: { type: String }
		},
		imageUrl: { type: String, required: true },
		type: { type: String, required: true }
	}
}, { _id: false });

const CustomerInfoSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	phone: {
		type: String,
		required: true
	},
	address: {
		type: String
	},
	city: {
		type: String
	},
	postalCode: {
		type: String
	}
}, { _id: false });

const OrderSchema = new mongoose.Schema({
	customerInfo: {
		type: CustomerInfoSchema,
		required: true
	},
	items: [CartItemSchema],
	subtotal: {
		type: Number,
		required: true,
		min: 0
	},
	tax: {
		type: Number,
		required: true,
		min: 0,
		default: 0
	},
	shipping: {
		type: Number,
		required: true,
		min: 0,
		default: 0
	},
	total: {
		type: Number,
		required: true,
		min: 0
	},
	currency: {
		type: String,
		required: true,
		default: 'NOK'
	},
	status: {
		type: String,
		enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
		default: 'pending'
	},
	paymentStatus: {
		type: String,
		enum: ['pending', 'completed', 'failed', 'refunded'],
		default: 'pending'
	},
	paymentMethod: {
		type: String,
		enum: ['stripe', 'vipps', 'other'],
		required: true
	},
	stripeSessionId: {
		type: String
	},
	stripePaymentIntentId: {
		type: String
	},
	notes: {
		type: String
	},
	trackingNumber: {
		type: String
	}
}, {
	timestamps: true
});

// Index for better query performance
OrderSchema.index({ 'customerInfo.email': 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ stripeSessionId: 1 });

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
