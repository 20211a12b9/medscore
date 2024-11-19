const asyncHandler=require("express-async-handler")
const Blog=require('../models/blogsModel')

//@desc post blogs 
//@router /api/user/blogs/
//@access public

const postBlogs = asyncHandler(async (req, res) => {
    const { title, content, author, tags } = req.body;

    if (!author || !title || !content) {
        res.status(400);
        throw new Error('Missing required data');
    }

    try {
        const blogs = await Blog.create({
            title,
            content,
            author,
            tags
        });

        res.status(201).json({
            _id: blogs._id,
            title: blogs.title,
            content: blogs.content,
            tags: blogs.tags,
            author: blogs.author
        });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to create blog');
    }
});
//@desc get blogs
//router /api/user/getBlogs/
//@access public

const getBlogs=asyncHandler(async(req,res)=>{
    try {
        const blogs = await Blog.find();
        res.json(blogs);
      } catch (err) {
        res.status(500).send(err.message);
      }
})
//@desc get blogs
//router /api/user/getBlogs/:id
//@access public

const getBlogsbyid=asyncHandler(async(req,res)=>{
    try {
        const id=req.params.id;
        const blogs = await Blog.find({_id: id});
        res.json(blogs);
      } catch (err) {
        res.status(500).send(err.message);
      }
})
module.exports={postBlogs,getBlogs,getBlogsbyid}
