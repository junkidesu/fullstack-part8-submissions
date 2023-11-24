const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
  },
  born: {
    type: Number,
  },
});

schema.plugin(uniqueValidator);

schema.virtual("bookCount", {
  ref: "Book",
  localField: "_id",
  foreignField: "author",
  count: true,
});

module.exports = mongoose.model("Author", schema);
