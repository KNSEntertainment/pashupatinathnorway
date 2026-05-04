import mongoose from "mongoose";

const generateTaxId = async () => {
  const year = new Date().getFullYear();

  const counter = await mongoose.models.Counter.findOneAndUpdate(
    { year, type: 'tax' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = String(counter.seq).padStart(6, '0');

  return `TAX-${year}-${seq}`;
};

export default generateTaxId;
