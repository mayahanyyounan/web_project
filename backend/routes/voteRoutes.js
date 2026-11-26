const express=require('express');
const router=express.Router();

const Post=require('../models/Post');
const Vote=require('../models/Vote');

router.put('/:postId/vote', async (req, res) => {
    try {
        const postId = req.params.postId;
        const { userId, voteType } = req.body;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});