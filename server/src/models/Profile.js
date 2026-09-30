const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    degree: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    year: {
      type: String,
      trim: true,
      maxlength: 20,
      default: '',
    },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    duration: {
      type: String,
      trim: true,
      maxlength: 50,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    headline: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },
    targetRole: {
      type: String,
      trim: true,
      maxlength: 80,
      default: '',
    },
    skills: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 40,
        },
      ],
      validate: [
        (val) => val.length <= 50,
        '{PATH} exceeds the limit of 50 items',
      ],
      default: [],
    },
    education: {
      type: [educationSchema],
      validate: [
        (val) => val.length <= 10,
        '{PATH} exceeds the limit of 10 items',
      ],
      default: [],
    },
    experience: {
      type: [experienceSchema],
      validate: [
        (val) => val.length <= 10,
        '{PATH} exceeds the limit of 10 items',
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Transform document to JSON: return 'id' instead of '_id', omit '__v' and 'userId'
profileSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.userId;
    return ret;
  },
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
