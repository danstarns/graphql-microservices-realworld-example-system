const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const Comment = new mongoose.Schema(
    {
        article: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Article",
            index: true
        },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        body: { type: String, required: true }
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

Comment.virtual("id").get(function getId() {
    return this._id.toString();
});

Comment.plugin(mongoosePaginate);

module.exports = mongoose.model("Comment", Comment);
