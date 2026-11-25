const mongoose=require('mongoose');
const voteSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },

    postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required:true
    },

    voteType:{
        type:Number,
        required: true,
        enum:[+1,-1]
    },
},
{timestamps: true});
//to prevent duplicates using compound index
voteSchema.index(
    {userId:1,postId:1}, //mongodb checks combination of both fields , 1:means ascending order
    {unique:true}
)
module.exports=mongoose.model('Vote',voteSchema);