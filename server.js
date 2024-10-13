/************************ Importing Modules ****************************/
//This server uses ES6 modules 
import dotenv from "dotenv"
dotenv.config()

import express, { request, response } from 'express'
const app = express()
import bcrypt from 'bcrypt'
import passport from 'passport'
import flash from 'express-flash'
import session from 'express-session'
import methodOverride from 'method-override'
import cookieParser from "cookie-parser"
import multer from "multer"

import {initialize} from './passport_config.js'
import {getBooksByGenre, borrowBook, registerUser, getUser_byEmail,
         getUserID, getUserInfo, getBookTitle} from './database.js'

/************************ Setting Up Middleware ************************/

app.set('view-engine', 'ejs')
//this allows us to get access to the http messages(rl, head, body)
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(cookieParser())
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

/************************ Routes for Home Page*****************************/

app.get('/', checkAuthenticated, async(request, response) => {

    try {
        const username = request.user.name
        const email = request.user.email
        const userId = await getUserID(username, email)
        const userInfo = await getUserInfo(userId)

      
        if((typeof(userInfo) === 'undefined')){

            const userInfo =[]
            userInfo.push({
                id: Date.now().toString(),
                Book_name: 'No book has been borrowed',
                Date_Due: 'No due date issued',
                Date_Borrowed: 'No book has been borrowed'
            })

            const dueDate = userInfo.Date_Due
            const borrowDate = userInfo.Date_Borrowed

            response.render('index.ejs', {
                name: request.user.name,
                 userInfo: userInfo, 
                 dueDate:dueDate, 
                 borrowDate:borrowDate
                }) 
                
        } else {
            response.render('index.ejs', {
                name: request.user.name,
                 userInfo: userInfo, 
                 dueDate:dueDate, 
                 borrowDate:borrowDate
                }) 
          }
    } catch {
        response.redirect('/errorPage')
    }
})

/************************ Routes for Login *****************************/

const users= []

initialize(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

app.get('/login', checkNotAuthenticated,(request, response) => {
    response.render('login.ejs')
})

app.post('/login',checkNotAuthenticated ,passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash: true
}))

/************************ Routes for Register ****************************/

app.get('/register',checkNotAuthenticated ,(request, response) => {
    response.render('register.ejs')
})

app.post('/register',checkNotAuthenticated ,async (request, response) => {
    try {
    
        const hashedPassword = await bcrypt.hash(request.body.password, 10)
        const name = request.body.name
        const email = request.body.email
        registerUser(name, email, hashedPassword)
        const current_user = await getUser_byEmail(email)
    
        users.push({
            id: Date.now().toString(),
            name: request.body.name,
            email: request.body.email,
            password: hashedPassword
        })
        
        response.redirect('/login')
        
    } catch {
        response.redirect('/register')
    }
})


/************************ Routes for Book catalogue **********************/
const horrorBooks = await getBooksByGenre('H')
const romanceBooks = await getBooksByGenre('R')
const classicBooks = await getBooksByGenre('C')
const chlidrensBooks = await getBooksByGenre('CB')

app.get('/catalogue', (request, response) =>{
    response.render('catalogue.ejs', {
        horrorBooks:horrorBooks, 
        romanceBooks:romanceBooks,
        classicBooks:classicBooks,
        chlidrensBooks:chlidrensBooks
    })
})

/************************ Routes for CheckOut **********************/
app.get('/checkout',(request, response) => {
    response.render('check_out.ejs')
})

app.post('/checkout', async(request, response)=>{
    try {
        const username = request.user.name
        const email = request.user.email
        const bookId = request.body.BookID
        const userId = await getUserID(username, email)
        const bookname = await getBookTitle(bookId)

        borrowBook(userId, bookId)
        response.download(`./books/${bookname.Title}.txt`)
        response.redirect('/successPage')
    } catch {
        response.redirect('/errorPage')
    }
    
})

/********************* Routes for Returning a book ********************/

const storage = multer.diskStorage({
    destination: function(request, file, cb){
        cb(null, './ReturnedBooks')
    },
    filename: function(request, file, cb){
        const suffix = Math.round(Math.random()*1e9)
        cb(null, file.originalname +'_'+ suffix)
    }
})

const upload = multer({storage})

app.get('/returnBook',(request, response) => {
    response.render('returns.ejs')
})

app.post('/returnBook', upload.single('ReturnedBook'), (request, response) => {
    try {
        response.send('Book has ben returned SUCCESSFULLY')
    } catch(err){
        response.redirect('/errorPage')
    }
   
})

/********************* Routes for Success/Error pages ********************/
app.get('/successPage', async(request, response) => {
    response.render('success.ejs')})

app.get('/errorPage',(request, response) => {
    response.render('error.ejs')
})

/************************ Routes for logout *****************************/

app.delete('/logout', (request, response) =>{
    request.logOut()
    response.redirect('/login')
})

/************************ Security Logic ***************************/

function checkAuthenticated(request, response, next){
    if (request.isAuthenticated()){
        return next()
    }
    response.redirect('/login')
}

function checkNotAuthenticated(request, response, next){
    if (request.isAuthenticated()){
        return response.redirect('/')
    }
    next()
}

/************************ Static files and Port **********************/

app.use(express.static('public'))
app.listen(3000)
