import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  state: { type: String, required: true },
  linkedin: { type: String, required: true },

  bio: { type: String, default: "" },
  school: { type: String, default: "" },
  major: { type: String, default: "" },
  experienceyears: { type: String, default: "" },
  industry: { type: String, default: "" },
  skills: { type: [String], default: [] },   // array of strings
  resume: { type: String, default: "" },
  photo: { type: String, default: "" },

  liked: { type: [String], default: [] },    // array of user IDs
  matched: { type: [String], default: [] },  // array of user IDs
  passed: { type: [String], default: [] },   // array of user IDs
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
