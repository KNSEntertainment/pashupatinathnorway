import mongoose from "mongoose";

const generateMembershipId = async () => {
  const year = new Date().getFullYear();

  const counter = await mongoose.models.Counter.findOneAndUpdate(
    { year, type: { $in: ['membership', undefined, null] } }, // Handle both types for backward compatibility
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = String(counter.seq).padStart(6, '0');

  return `MEM-${year}-${seq}`;
};

export default generateMembershipId;
