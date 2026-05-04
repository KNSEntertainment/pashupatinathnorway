import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['membership', 'tax'],
    required: true,
  },
  seq: {
    type: Number,
    default: 0
  }
});

// Compound index for year + type to ensure uniqueness
CounterSchema.index({ year: 1, type: 1 }, { unique: true });

export default mongoose.models.Counter || mongoose.model("Counter", CounterSchema);
