const asyncHandler = require("express-async-handler");
const Blog = require('../models/blogsModel');

//@desc post blogs 
//@route POST /api/user/blogs/
//@access public
const postBlogs = asyncHandler(async (req, res) => {
    const { title, content, author, tags, image } = req.body;
  
    console.log( author);

    if (!title || !content ) {
        return res.status(400).json({ message: 'Missing required data' });
    }

    try {
        const blog = await Blog.create({
            title,
            content,
            author: author || 'Anonymous', // Default author if not provided
            tags: Array.isArray(tags) ? tags : [], // Ensure tags is always an array
            image
        });

        res.status(201).json({
            _id: blog._id,
            title: blog.title,
            content: blog.content,
            tags: blog.tags,
            author: blog.author,
            image: blog.image
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to create blog',
            error: error.message 
        });
    }
});
//@desc get all blogs
//@route GET /api/user/getBlogs/
//@access public
const getBlogs = asyncHandler(async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching blogs', error: err.message });
    }
});

//@desc get blog by id
//@route GET /api/user/getBlogs/:id
//@access public
const getBlogsById = asyncHandler(async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            res.status(404);
            throw new Error('Blog not found');
        }
        
        res.json(blog);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching blog', error: err.message });
    }
});

module.exports = { postBlogs, getBlogs, getBlogsById };