const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const Article = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        body: { type: String, required: true },
        description: { type: String, required: true },
        tagList: [String],
        title: { type: String, required: true }
    },
    {
        timestamps: true,
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true
        }
    }
);

Article.virtual("id").get(function getId() {
    return this._id.toString();
});

Article.plugin(mongoosePaginate);

module.exports = mongoose.model("Article", Article);
