const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeText: {
      type: String,
      required: true,
      maxlength: 20000,
    },
    resumeSource: {
      type: String,
      enum: ['paste', 'pdf', 'profile'],
      default: 'paste',
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    jobDescription: {
      type: String,
      trim: true,
      maxlength: 10000,
      default: '',
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for history queries
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ userId: 1, overallScore: -1 });
analysisSchema.index({ userId: 1, targetRole: 1 });

// Transform document to JSON: return 'id' instead of '_id', omit '__v', 'userId', 'resumeText', and 'jobDescription'
analysisSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.userId;
    delete ret.resumeText;
    delete ret.jobDescription;
    return ret;
  },
});

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = Analysis;
