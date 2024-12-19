require('dotenv').config()

const express = require('express')
const router = express.Router()
const { User } = require('../models/aconselhadorModel')
const { passport } = require('../configs/passport')


router.get('/register', (req, res) => {
    res.render('register', { title: "Aconselhador Bíblico | Signup", })
})

router.post('/register', async (req, res) => {
    const { username, email, password, confpass } = req.body
    
    try {
        const checkUser = await User.findOne({ where: { email } })
        
        if (checkUser) {
            return res.render('register', { error: 'E-mail já registrado.' })
        }

        if (password != confpass) {
            return res.render('register', { error: 'Palavras-passe não coincidem, verifique e tente novamente.' })
        }

        const newUser = await User.create({
            username,
            email,
            password
        })

        res.redirect('/')

    } catch (error) {
        console.error(error);
        res.render('register', { error: 'Erro ao registrar o usuário, tente novamente.' })
    }

})

router.get('/login', (req, res) => {
    res.render('login', { title: "Aconselhador Bíblico | Signin", })
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err)
        }
        if (!user) {
            return res.render('login', {error: info.message })
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err)
            }
            req.session.userId = user.id
            return res.redirect('/')
        })
    })(req, res, next)

})

// Logout
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/')
    })
})

module.exports = router