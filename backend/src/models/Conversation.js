import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role:      { type: String, enum: ['user', 'assistant'], required: true },
    content:   { type: String, required: true },
    language:  { type: String, default: 'en' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionId:     { type: String, required: true, unique: true },
    title:         { type: String, default: 'New Conversation', maxlength: 80 },
    messages:      { type: [messageSchema], default: [] },
    orderId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    status:        { type: String, enum: ['active', 'completed'], default: 'active' },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

conversationSchema.index({ user: 1, lastMessageAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
