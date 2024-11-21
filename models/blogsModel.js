const mongoose=require('mongoose');
const { image } = require('pdfkit');


const blogsmodel=mongoose.Schema({
    title:{
        type:String,
        required:[true,'title is manadatory']
    },
    author:{
        type:String,
        required:[true,'author is manadatory']
    },
    content:{
        type:String,
        required:[true,'content is manadatory']
    },
    tags:{
        type: [String]
    },
    image:{
        type:String
    }

},{
    timestamps:true
})

module.exports=mongoose.model('Blog',blogsmodel)