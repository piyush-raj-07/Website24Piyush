const Blog = require('../models/Blogs');
const UserModel = require('../models/Users');
const { verifyToken } = require('../middleware/verifyToken');


const getBlog = async (req, res) => {
    const id = req.params.id;
    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.status(200).json(blog);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
}
const writeBlog = async (req, res) => {
    const { title, body, cat } = req.body;

    // getting some user info

    const userId = req.userId;
    const userdetail = await UserModel.findById(userId);
    // console.log(userdetail);


    try {
        //extra data
        const name = userdetail.Name;
        const Img_URL = userdetail.Img_URL;
        const Degree = userdetail.Degree;
        const Grad_Year = userdetail.Grad_Year;
        const blog = new Blog({
            title,
            body,
            cat,
            author_id: req.userId,
            Auth_Name: name,
            Auth_Img: Img_URL,
            Auth_Degree: Degree,
            Auth_Grad_Year: Grad_Year
        });

        const savedBlog = await blog.save();
        res.status(201).json(savedBlog);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
}
const editBlog = async (req, res) => {
    const id = req.params.id;
    try {
        const blog = await Blog.findById(id);
        if (blog.author_id != req.userId) {
            return res.status(403).json({ message: 'You are not authorized to edit this blog' });
        }
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
    
        if(blog.approval=='Denied'){
            blog.title = req.body.title;
            blog.body = req.body.body;
            blog.cat=req.body.cat;
            blog.status="Not-verified";
            blog.approval="Pending";
            const updatedBlog = await blog.save();
            res.status(200).json(updatedBlog);
        }else{
        blog.title = req.body.title;
        blog.body = req.body.body;
        blog.cat = req.body.cat;
        const updatedBlog = await blog.save();
        res.status(200).json(updatedBlog);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
}
const deleteBlog = async (req, res) => {
    const id = req.params.id;
    try {
        console.log(id);
        const blog = await Blog.findByIdAndDelete(id);
        console.log(blog);
        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
}

const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ approval: "Approved" }).sort({ date: -1 });
        res.status(200).json(blogs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
}

const getAllBlogsByCategory = async (req, res) => {
    // const { cat } = req.params.cat;
    try {
        const blogs = await Blog.find({ cat: req.params.cat, approval: "Approved" }).sort({ upvote: -1, date: -1 });
        res.status(200).json(blogs);


    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
}

const getMyBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ author_id: req.userId }).sort({ date: -1 });
        res.status(200).json(blogs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
}

const upvotePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const post = await Blog.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }


        if (!post.upvotedUsers) {
            post.upvotedUsers = [];
        }


        if (post.upvotedUsers.includes(userId)) {
            return res.status(400).json({ message: "You have already upvoted this post" });
        }

        post.upvote += 1;
        post.upvotedUsers.push(userId);
        await post.save();

        res.status(200).json({ upvotes: post.upvote });
    } catch (error) {
        console.error("Error upvoting post:", error);
        res.status(500).json({ message: "Server Error" });
    }
};



module.exports = { getBlog, writeBlog, editBlog, deleteBlog, getAllBlogs, getAllBlogsByCategory, getMyBlogs, upvotePost };