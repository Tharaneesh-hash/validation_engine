import mongoose from 'mongoose';

/**
 * UserAccount Mongoose Schema
 * Supports optional authentication and user-scoped validation rule management.
 */
const UserAccountSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    role: {
      type: String,
      enum: ['USER', 'ENGINEER', 'ADMINISTRATOR'],
      default: 'USER'
    },
    savedDfaConfigurations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DFAConfiguration'
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const UserAccount = mongoose.model('UserAccount', UserAccountSchema);

export default UserAccount;
