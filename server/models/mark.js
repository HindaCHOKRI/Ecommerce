//Mark.JS to create Mark Schema in the application

//Including the required packages and assigning it to Local Variables
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const deepPopulate = require("mongoose-deep-populate")(mongoose);
const mongooseAlgolia = require("mongoose-algolia");

//Creating a new Product Schema
const MarkSchema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category"
  },
  image: String,
  title: String,
  isDeleted: Boolean,
  created: {
    type: Date,
    default: Date.now
  },
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  },
});

MarkSchema.virtual("averageRating").get(function () {
  var rating = 0;
  if (this.reviews.length == 0) {
    rating = 0;
  } else {
    this.reviews.map((review) => {
      rating += review.rating;
    });
    rating = rating / this.reviews.length;
  }
  return rating;
});

//Adding Plug-ins to ProductSchema like Algolia to facilitate searching of products
MarkSchema.plugin(deepPopulate); //Facilitate rating of the product
MarkSchema.plugin(mongooseAlgolia, {
  appId: "KW06GS4929",
  apiKey: "ca7080fd8e24ae3f2ad56e68af784fc5",
  indexName: "Ecommercever1",
  selector: "_id title image reviews description price owner created averageRating",
  populate: {
    path: "owner reviews",
    select: "name rating",
  },
  defaults: {
    author: "uknown",
  },
  mappings: {
    title: function (value) {
      return `${value}`;
    },
  },
  debug: true,
});

//Wrapping product schema to Model and synchronizing Algolia API
let Model = mongoose.model("Mark", MarkSchema);
Model.SyncToAlgolia();
Model.SetAlgoliaSettings({
  searchableAttributes: ["title"],
});

//Exporting the wrapped Model(Algolia API + ProductSchema)
module.exports = Model;