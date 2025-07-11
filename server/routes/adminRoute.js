const express = require('express');
const router=express.Router();
const verifyToken= require('../middleware/verifyToken');
const isAdmin= require('../middleware/verifyAdmin');
const UserModel = require('../models/Users');
const Blog = require('../models/Blogs');

router.get('/',verifyToken,isAdmin,async(req,res)=>{
    res.status(200).json({message:"success"});
})

router.get('/all',verifyToken,isAdmin,async(req,res)=>{
    try{
        const blogs=await Blog.find({status:"Not-verified"});
        res.status(200).json(blogs);
    }
    catch(err){
        console.log(err);
        res.status(500).send('Server Error');
    }
})
router.put('/blog/approve/:id',verifyToken,isAdmin,async(req,res)=>{
    try{
        const blogId=req.params.id;
        const blog=await Blog.findByIdAndUpdate(blogId,{status:"Verified",approval:"Approved"});
        blog.save();
        res.status(200).json({message:"Success"});
    }
    catch(err){
        res.status(500).send('Server Error');
    }
})

router.put('/blog/reject/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const blogId = req.params.id;
        const { comment } = req.body;

        const blog = await Blog.findById(blogId);
        
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        blog.status = "Verified";
        blog.approval = "Denied";
        blog.comment = comment;

        await blog.save();

        res.status(200).json({ message: "Success", rejectionComment: comment });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports=router;