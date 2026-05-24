import mongoose, { Document, Schema, Types } from 'mongoose';

export type Frequency = 'daily' | 'weekly';

export interface IHabit extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  frequency: Frequency;
  tags: string[];
  reminderTime?: string; // stored as "HH:MM" string, no scheduling logic
}

const habitSchema = new Schema<IHabit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    frequency: {
      type: String,
      enum: { values: ['daily', 'weekly'], message: 'Frequency must be either daily or weekly' },
      required: [true, 'Frequency is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    reminderTime: {
      type: String,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Reminder time must be in HH:MM format'],
    },
  },
  { timestamps: true }
);

// prevents two habits with the same title for the same user
// case-insensitive check is handled in the controller before this index is hit
habitSchema.index({ userId: 1, title: 1 }, { unique: true });

// speeds up GET /habits?tag=... queries
habitSchema.index({ userId: 1, tags: 1 });

export const Habit = mongoose.model<IHabit>('Habit', habitSchema);
