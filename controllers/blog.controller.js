const { request } = require('express');
const Blog = require('../models/blog.model');
const User = require('../models/user.model');


exports.createBlog = async (req, res, next) => {
    try {
        const { title, description, tags, body, state } = req.body;

        const blog = await Blog.create({
            title,
            description,
            tags,
            body,
            state: state || 'draft', // Defaults to draft if not provided
            author: req.user._id     // Taken from 'protect' middleware
        });

        res.status(201).json({ status: 'success', data: blog });
    } catch (err) {
        next(err);
    }
};

exports.getAllBlogs = async (req, res, next) => {
    try {
        const { search, orderBy, tag } = req.query;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const skip = (page - 1) * limit;

        const query = { state: 'published' };
        
        // Search by title, tags, or author name
        if (search){
            // First, find users matching the search term
            const matchingUsers = await User.find({
                $or: [
                    { first_name: { $regex: search, $options: 'i' } },
                    { last_name: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            
            const userIds = matchingUsers.map(user => user._id);
            
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
                { author: { $in: userIds } }
            ];
        }
        
        if (req.query.author) { 
            query.author = req.query.author;
        }
        if (tag) {
            query.tags = tag;
        }
        
        // Determine sort order
        let sortOption = { timestamp: -1 }; // Default: newest first
        if (orderBy) {
            if (orderBy === 'read_count') {
                sortOption = { read_count: -1 };
            } else if (orderBy === 'reading_time') {
                sortOption = { reading_time: 1 };
            } else if (orderBy === 'timestamp') {
                sortOption = { timestamp: -1 };
            }
        }
        
        const blogs = await Blog.find(query)
            .populate('author', 'first_name last_name email') // Populate author details
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        const total = await Blog.countDocuments(query);

        res.status(200).json({ status: 'success', data: blogs, page, limit, total });
    } catch (err) {
        next(err);
    }
};

exports.getBlogById = async (req, res, next) => {
    try {
        // Use findByIdAndUpdate to increment read_count and return the blog in one go
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $inc: { read_count: 1 } }, // Increment read_count by 1
            { returnDocument: 'after' }
        ).populate('author', 'first_name last_name email'); // Return author details

        if (!blog || blog.state !== 'published') {
            const error = new Error('Blog not found');
            error.statusCode = 404;
            error.status = 'fail';
            error.isOperational = true;
            return next(error);
        }

        res.status(200).json({ status: 'success', data: blog , read_count: blog.read_count });
    } catch (err) {
        next(err);
    }
};
exports.updateBlog = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, body, tags, state } = req.body;

        // 1. Find the blog
        const blog = await Blog.findById(id);

        if (!blog) {
            const error = new Error('Blog not found');
            error.statusCode = 404;
            error.status = 'fail';
            error.isOperational = true;
            return next(error);
        }

        // 2. Check if the logged-in user is the owner
        // blog.author is an ObjectId, req.user._id is also an ObjectId
        // Use .toString() or .equals() for comparison
        if (blog.author.toString() !== req.user._id.toString()) {
            const error = new Error('You are not authorized to update this blog');
            error.statusCode = 403;
            error.status = 'fail';
            error.isOperational = true;
            return next(error);
        }

        // 3. Update the blog
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            { title, description, body, tags, state },
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({ status: 'success', data: updatedBlog });
    } catch (err) {
        next(err);
    }
};

exports.deleteBlog = async (req, res, next) => {
    try {
        const { id } = req.params;

        // 1. Find the blog
        const blog = await Blog.findById(id);

        if (!blog) {
            const error = new Error('Blog not found');
            error.statusCode = 404;
            error.status = 'fail';
            error.isOperational = true;
            return next(error);
        }

        // 2. Check if the logged-in user is the owner
        if (blog.author.toString() !== req.user._id.toString()) {
            const error = new Error('You are not authorized to delete this blog');
            error.statusCode = 403;
            error.status = 'fail';
            error.isOperational = true;
            return next(error);
        }

        // 3. Delete the blog
        await blog.deleteOne();

        res.status(200).json({ status: 'success', data: null });
    } catch (err) {
        next(err);
    }
};

exports.getMyBlogs = async (req, res, next) => {
    try {
        // Pagination
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const skip = (page - 1) * limit;
        
        // Build query
        const query = { author: req.user._id };
        
        // Filter by state if provided
        if (req.query.state) {
            if (req.query.state === 'draft' || req.query.state === 'published') {
                query.state = req.query.state;
            }
        }
        
        // Find blogs with pagination
        const blogs = await Blog.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Blog.countDocuments(query);
        
        res.status(200).json({ 
            status: 'success', 
            data: blogs,
            page,
            limit,
            total
        });
    } catch (err) {
        next(err);
    }
};
