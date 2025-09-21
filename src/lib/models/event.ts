import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  time: { type: String, required: true },
  host: { type: String, required: true },
  venue: { type: String, default: "undefined" },
  address: { type: String, default: "undefined" },
  cleaned_url: { type: String, required: true },
  image_url: { type: String, default: "Image not found" },
  map_url: { type: String, default: "Map link not found" },
  tags: { type: [String], default: [] },       
  attendees: { type: [String], default: [] },  
}, { timestamps: true });

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;
