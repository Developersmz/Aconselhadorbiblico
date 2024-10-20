require('dotenv').config()

const express = require('express')
const nodemailer = require('nodemailer')
const router = express.Router()


// Models
const {User, Phrase, Doutrine} = require('../models/aconselhadorModel')

// Config Middleware
router.use(express.urlencoded({ extended: true }))
router.use(express.json())

// Rota inicial
router.get('/', async (req, res) => {
    const db_phrases = await Phrase.findAll()
    const db_doutrines = await Doutrine.findAll()

    const userId = req.session.userId
    let user = ""

    if (userId) {
        user = await User.findByPk(userId)
    }

    // function hashPassword(password) {
    //     const saltRounds = 10; // Define o número de rounds para gerar o salt
    //     bcrypt.hash(password, saltRounds, (err, hash) => {
    //         if (err) {
    //             console.error('Erro ao hashear a senha:', err);
    //         } else {
    //             console.log('Senha hasheada:', hash);
    //         }
    //     });
    // }
    // hashPassword('0115183aBC$')

    const phr = db_phrases.map(items => items.toJSON())
    const dout = db_doutrines.map(items => items.toJSON())

    res.render('index', {db_phrases: phr, db_doutrines: dout, user: user.dataValues })
    
})

router.post('/send_message', async (req, res) => {
    const { name, email, message } = req.body

    // Configurando Nodemailer para envio de e-mail
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
    })

    try {
        const mailOptions = {
            to: process.env.EMAIL_USER,
            from: email,
            subject: `Nova mensagem de contato de ${name}`,
            text: `Você recebeu uma nova mensagem de ${name} (${email}):\n\n${message}`
        }

        await transporter.sendMail(mailOptions)
        
        res.render('output', { success: 'E-mail enviado com sucesso!'})

    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
        res.render('output', { error: 'Falha ao enviar o e-mail.' })
    }
})


module.exports = router
