const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  proposer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  category: {
    type: String,
    enum: ['event', 'activity', 'improvement', 'funding', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'implemented'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  estimatedCost: {
    type: Number,
    min: 0
  },
  estimatedDuration: String,
  requirements: [String],
  benefits: [String],
  risks: [String],
  reviews: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['approved', 'rejected', 'needs_revision']
    },
    comments: String,
    reviewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    name: String,
    url: String,
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Proposal', proposalSchema);

