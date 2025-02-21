const { default: mongoose } = require('mongoose')
const moongose=require('mongoose')

const chatschema=mongoose.Schema({
    text: {
        type: String,
        required: true
      },
      isBot: {
        type: Boolean,
        default: false
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      sessionId: {
        type: String,
        required: true
      },
      language: {
        type: String,
        default: 'en'
      }
},
{
    timestamps:true
})

module.exports=moongose.model('chatbot',chatschema)