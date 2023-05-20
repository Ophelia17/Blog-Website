require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
const Article = require('./models/article')
const articleRouter = require('./routes/articles')
const methodOverride = require('method-override');
const User = require('./models/user');
const app = express()
const loginRouter = require('./routes/login');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

app.use(cookieParser())

const dbConn = async () =>{
  try{
    await mongoose.connect('mongodb://localhost/blog', {
      useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
    })
  }catch(error){  
    console.log(error)
  }
}

dbConn();

const users = async () =>{
  const users = await User.find();
  console.log(users);
}

users();

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))




const loggedin = (req,res,next) =>{
  const cookies = req.cookies
  if(!req?.cookies?.token) return res.sendStatus(401);
  const token = cookies.token;
  jwt.verify(
    token,
    'sara',
    async (err , decoder) =>{
      if(err) return res.sendStatus(403);
      if(!decoder?.name) return res.sendStatus(403);
      const foundUser = User.findOne({ name : decoder.name });
      if(!foundUser.name){
        res.clearCookie('token', { httpOnly: true, sameSite: 'None'});
        res.redirect('/articles/login');
        next();
      }
    }
  )
  next(); 
}
//app.use(loggedin); 

app.get('/', async (req, res) => {
  console.log(req.cookies)
  const articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('articles/index', { articles: articles , cookies: req.cookies })
})

app.use('/articles', articleRouter)


app.listen(5000)