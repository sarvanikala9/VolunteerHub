import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required']
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    attendanceStatus: {
      type: String,
      enum: ['Not Marked', 'Attended', 'Absent'],
      default: 'Not Marked'
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate registrations for the same student email and event
registrationSchema.index({ email: 1, eventId: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

export default Registration;
