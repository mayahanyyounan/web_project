const express=require('express');
const router=express.Router();

const Post=require('../models/Post');

router.post('/', async(req,res)=>{
    try{
    const {title,content,authorId,communityId}= req.body;  //1] recieve request thru req.body

    const newPost= await Post.create({ //2]creates a new doc using post model and saves it in mongodb
        title,content,authorId,communityId
    });
    res.status(201).json(newPost);
    } catch(error){
        res.status(500).json({message:error.message});
    }
})
router.get('/', async (req, res) => {
    try {
        // 1. Sorting
        const sortType = req.query.sort;
        let sortOption = { createdAt: -1 };

        if (sortType === 'top') {
            sortOption = { score: -1 };
        }

        // 2. Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 3. Retrieve posts
        const posts = await Post.find()
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        res.status(200).json(posts);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}); 

//EDIT POST
router.patch('/:id',async(req,res)=>{  //frontend haybaatlo el id ashan yedit fl post
    try{
        const postId=req.params.id; //id hwa el requested one , params contains variable ml url
        const {title,content,image,authorId}=req.body; //extracts updated fields sent by frontend
        const changes = {};

        if (title !== undefined) changes.title = title;
        if (content !== undefined) changes.content = content;
        if (image !== undefined) changes.image = image;
        const updatedPost = await Post.findOneAndUpdate({_id:postId,authorId},{ $set:changes },{ new: true, runValidators: true });
        //updates post inside mongodb by finding it first by id
        //findOneAndUpdate() lets us search using multiple conditions.

        if(!updatedPost){
            return res.status(404).json({message:'Post not found'});
        }
        res.status(200).json(updatedPost);
    }catch(error){
        res.status(500).json({message:error.message});
    }
});

router.delete('/:id',async(req,res)=>{
    try{
        const {authorId}=req.body;
        const postId=req.params.id;
        const deletedPost=await Post.findOneAndDelete({_id:postId,authorId:authorId});
        if(!deletedPost){
            return res.status(404).json({message:'Post not found or you are not the author'});
        }
        res.status(200).json({message:'Post deleted successfully'});
      }catch(error){
        res.status(500).json({message:error.message});
    }
});
module.exports = router;
