const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {type: String,required: true,trim: true,minlength: 3,maxlength: 21,match: /^[A-Za-z0-9_]+$/},
  description: { type: String, maxlength: 500, default: '' },
  moderatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  membercount: { type: Number, default: 1 },
  image: { type: String, default: '' }
}, { timestamps: { createdAt: true, updatedAt: false } });

communitySchema.index(
  { name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

module.exports = mongoose.model('Community', communitySchema);