import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  _id: string;
  name?: string;
  email: string;
  password?: string;
  otp?: string;
  otpExpiry?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

const userSchema: Schema<User> = new Schema(
  {
    name: {
      type: String,
      required: false,
      minLength: [2, "Name should be atleast 2 characters."],
      maxLength: [30, "Name should be maximum 30 characters."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please use a valid email address.",
      ],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    otp: {
      type: String,
      required: false,
    },
    otpExpiry: {
      type: Date,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      required: false,
    },
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", userSchema);

export default UserModel;
