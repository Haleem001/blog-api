const mongoose = require('mongoose');
const { calculateReadingTime } = require('../utils/blog.utils');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    body: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    state: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    read_count: {
        type: Number,
        default: 0
    },
    reading_time: {
        type: String,
    },
    tags: [String],
    timestamp: {
        type: Date,
        default: Date.now
    },


});


// Pre-save hook to calculate reading time before saving to DB
blogSchema.pre('save', function () {
    // Only recalculate if the body has changed
    if (this.isModified('body')) {
        this.reading_time = calculateReadingTime(this.body);
    }
});

module.exports = mongoose.model('Blog', blogSchema);
