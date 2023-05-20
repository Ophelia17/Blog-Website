const express = require('express')
const Article = require('./../models/article')
const User = require('../models/user')
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.post('/register' ,createNewUser())

router.get('/logout' , (req,res)=>{
  res.clearCookie("token")
  return res.redirect('/')
})

router.post('/login' ,loginUser())

router.get('/login' , (req,res)=>{
    res.render('articles/loginForm' , { user : new User() })
  })

 function loginUser (){
    return async (req,res) =>{
     const { name , password } = req.body;
     try {
       const foundUser = await User.findOne({ name }).exec();
       const match =  await bcrypt.compare(password , foundUser.password);
       console.log(match)
       if(!match) return res.status(401).send('The password was wrong');
       req.user = foundUser;
       console.log(req.user)
       const token = jwt.sign(
         {
           name: foundUser.name
         },
         'sara',
         { expiresIn : '1d'}
       )
       res.cookie('token' , token ,{
         httpOnly:true,
         sameSite:'none',
         secure:true,
         maxAge: 24 *  60 * 60 * 1000 
       })
       return res.redirect('/');
     } catch (error) {
       console.log(error);
     }
    }
   }
router.get('/register' , (req,res)=>{
  res.render('articles/userForm' , { user : new User() })
})   


router.get('/new', (req, res) => {
  res.render('articles/new', { article: new Article() })
})

router.get('/edit/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.render('articles/edit', { article: article })
})

router.get('/:slug', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug })
  if (article == null) res.redirect('/')
  res.render('articles/show', { article: article })
})

router.post('/', async (req, res, next) => {
  req.article = new Article()
  next()
}, saveArticleAndRedirect('new'))

router.put('/:id', async (req, res, next) => {
  req.article = await Article.findById(req.params.id)
  next()
}, saveArticleAndRedirect('edit'))

router.delete('/:id', async (req, res) => {
  await Article.findByIdAndDelete(req.params.id)
  res.redirect('/')
})

function createNewUser(){
  return async(req, res) =>{
    const { name , password } = req.body;
    try {
      const newUser = {
        name,
        password
      }
      const response = User.create(newUser);
      if(!response) return res.sendStatus(400).json({ message : "The request is Invalid"});

    } catch (error) {
       return res.sendStatus(400).json(error)
    }
    res.redirect('/')
  }
}



function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown
    try {
      article = await article.save()
      res.redirect(`/articles/${article.slug}`)
    } catch (e) {
      res.render(`articles/${path}`, { article: article })
    }
  }
}

module.exports = router