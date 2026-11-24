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
module.exports = router;
