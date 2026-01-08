import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true }, // Admin user ID
  },
  { timestamps: true }
);

// Index for efficient queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model('Product', productSchema);
