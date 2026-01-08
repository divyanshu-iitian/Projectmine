import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, index: true },
    change: { type: Number, required: true }, // +/- quantity
    reason: { type: String, required: true }, // 'init', 'reserve', 'release', 'adjust'
    performedBy: { type: String, required: true }, // user ID or 'system'
    metadata: { type: mongoose.Schema.Types.Mixed }, // additional context
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for audit queries
inventoryLogSchema.index({ productId: 1, createdAt: -1 });

export default mongoose.model('InventoryLog', inventoryLogSchema);
