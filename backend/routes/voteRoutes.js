const express=require('express');
const router=express.Router();

const Post=require('../models/Post');
const Vote=require('../models/Vote');

//UPVOTE OR DOWNVOTE A POST  ,CHANGE VOTE
router.put('/:postId/vote', async (req, res) => {
    try {
        const postId = req.params.postId;
        const { userId, voteType } = req.body;
        let scoreChange = 0;

        //Validate voteType
        if(voteType !==1 && voteType !== -1){
            return res.status(400).json({message: 'Invalid VoteType , must be 1 or -1'});
        }
        
        //Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const existingVote= await Vote.findOne({userId,postId});
        if(existingVote){
            //change only if voteType is different
            if(existingVote.voteType!==voteType){
                scoreChange=voteType-existingVote.voteType;
                existingVote.voteType=voteType;  //changes old vote to new one
                await existingVote.save();
            }
         } else{
            await Vote.create({
                userId,postId,voteType
            });
            scoreChange=voteType;
            //update post score
        }

        if(scoreChange!==0){
            await Post.findByIdAndUpdate(postId , { $inc: { score:scoreChange}});
                }


        return res.status(200).json({message: 'Vote submited successfully'});
          

            }catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

//Delete Vote
router.delete('/:postId/vote', async(req,res)=>{
    try{
        const postId=req.params.postId;
        const {userId}=req.body;

        //1]find post using id
        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({message:'Post not found'});
        }
        //2]find user's vote
        const exisitngVote=await Vote.findOne({userId,postId});
        if(!exisitngVote){
            return res.status(404).json({message:'Vote not found'});
        }

        //3]delete the vote
        const scoreChange=-exisitngVote.voteType; //undo vote
        await exisitngVote.deleteOne(); 
        await Post.findByIdAndUpdate(postId,{$inc:{score:scoreChange}});
        //$inc can increment or decrement aala hsab elvalue + wla -

        return res.status(200).json({message:'Vote deleted successfully'});

    }catch(error){
        res.status(500).json({message:error.message});
    }

})

module.exports = router;
