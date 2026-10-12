import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['Urgent', 'Important', 'General', 'Highlight'],
      default: 'General'
    },
    clubOrWing: {
      type: String,
      default: 'Campus Volunteer Council'
    },
    author: {
      type: String,
      default: 'Volunteer Coordinator'
    },
    linkEventId: {
      type: String,
      default: ''
    },
    pinned: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
export default Announcement;
