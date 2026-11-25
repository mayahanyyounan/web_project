const mongoose=require('mongoose');
const postSchema=new mongoose.Schema({
    title: {
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
        },
    authorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    communityId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Community',
        required:true
    },
    image:{
        type:String,
    },
    score:{
        type:Number,
        default:0
    },
    summary:{
        type:String,
    },
    commentCount:{
        type:Number,
        default:0
    },
    }, 
{ timestamps: true }); //instead of createdAt and UpdatedAt
module.exports = mongoose.model('Post', postSchema);