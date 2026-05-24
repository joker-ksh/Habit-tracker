import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITrackingLog extends Document {
  habitId: Types.ObjectId;
  userId: Types.ObjectId;
  completedOn: Date; // stored as UTC midnight — no time component
}

const trackingLogSchema = new Schema<ITrackingLog>(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: 'Habit',
      required: [true, 'Habit ID is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    completedOn: {
      type: Date,
      required: [true, 'Completion date is required'],
    },
  },
  { timestamps: true }
);

// one log per habit per day — MongoDB will reject duplicates at the DB level
trackingLogSchema.index({ habitId: 1, completedOn: 1 }, { unique: true });

export const TrackingLog = mongoose.model<ITrackingLog>('TrackingLog', trackingLogSchema);
