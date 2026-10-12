import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      default: 'svecw@2026'
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      default: 'Computer Science & Engineering'
    },
    year: {
      type: String,
      default: '3rd Year'
    },
    phone: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    skills: {
      type: [String],
      default: []
    },
    bio: {
      type: String,
      default: 'Passionate student eager to serve the community and make our college campus greener and kinder.'
    },
    totalHours: {
      type: Number,
      default: 0
    },
    karmaPoints: {
      type: Number,
      default: 0
    },
    badges: [
      {
        id: String,
        name: String,
        description: String,
        icon: String,
        awardedAt: { type: Date, default: Date.now }
      }
    ],
    role: {
      type: String,
      enum: ['student', 'coordinator', 'admin'],
      default: 'student'
    }
  },
  {
    timestamps: true
  }
);

export const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', volunteerSchema);
export default Volunteer;
