const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name : {
      type : String,
      required: true
    },
    password : String,
    articles : [{
      type: mongoose.Schema.Types.ObjectId,
      rel:'Article'
    }]
})

userSchema.pre('save' ,async  function(next) {
    if(!this.isModified('password')) return next();
    const hashedPwd =await bcrypt.hash(this.password , 10)
    this.password = hashedPwd;
    next();
})


userSchema.methods.comparePwd =async  function(password , cb) {
    try {
        const match = await bcrypt.compare(password , this.password)
        if(!match) return cb(null , match)
        return cb(null , this)
    } catch (error) {
        return cb(error)
    }   
}

module.exports = mongoose.model('User' , userSchema)
