import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  stripeSessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'usd',
    lowercase: true
  },
  status: {
    type: String,
    enum: ['INITIATED', 'SUCCESS', 'FAILED'],
    default: 'INITIATED',
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for querying by orderId and status
paymentSchema.index({ orderId: 1, status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
