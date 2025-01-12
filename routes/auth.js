require('dotenv').config()

const express = require('express')
const router = express.Router()
const { User } = require('../models/aconselhadorModel')
const { passport } = require('../configs/passport')
const { body, validationResult } = require('express-validator')


router.get('/register', (req, res) => {
    res.render('register')
})

router.get('/register', (req, res) => {
    res.render('register', { title: "Aconselhador Bíblico | Signup", })
})

router.post(
    '/register',
[
body('username').trim().notEmpty().withMessage('O nome de usuário é obrigatório!'),
body('email')
    .trim()
    .isEmail()
    .withMessage('Forneça um endereço de e-mail válido!'),
body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('A senha deve ter pelo menos 6 caracteres!'),
body('confpass')
    .trim()
    .custom((value, { req }) => value === req.body.password)
    .withMessage('As senhas não coincidem!'),
],
async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.render('register', {
            error: errors.array().map(err => err.msg).join('<br>'),
        })
    }

    const { username, email, password } = req.body;

    try {
        const checkUser = await User.findOne({ where: { email } })
        if (checkUser) {
            return res.render('register', { error: 'E-mail já registrado.' });
        }

        const newUser = await User.create({
            username,
            email,
            password, // Certifique-se de hash de senha antes de salvar!
          });

          req.logIn(newUser, (err) => {
            if (err) {
              console.error(err);
              return res.render('register', { error: 'Erro ao autenticar o usuário, tente novamente.' });
            }
            req.session.userId = newUser.id; // Salvar o ID do usuário na sessão
            return res.redirect('/?logged=true');
          });
    } catch (error) {
        console.error(error);
      return res.render('register', { error: 'Erro ao registrar o usuário, tente novamente.' });
    }
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.post(
    '/login',
    [
      // Validações antes da autenticação
      body('email').trim().isEmail().withMessage('Forneça um e-mail válido!'),
      body('password').trim().notEmpty().withMessage('A senha é obrigatória!'),
    ],
    (req, res, next) => {
      const errors = validationResult(req);
  
      // Verificar erros de validação
      if (!errors.isEmpty()) {
        return res.render('login', {
          error: errors.array().map(err => err.msg).join('<br>'),
        });
      }
  
      // Processar autenticação com Passport.js
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          console.error('Erro de autenticação:', err);
          return next(err); // Registrar erro no middleware
        }
        if (!user) {
          return res.render('login', {
            error: info?.message || 'Credenciais inválidas. Tente novamente!',
          });
        }
        req.logIn(user, (err) => {
          if (err) {
            console.error('Erro ao logar o usuário:', err);
            return next(err);
          }
          req.session.userId = user.id;
          return res.redirect('/?logged=true');
        });
      })(req, res, next);
    }
  );

// Logout
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/')
    })
})

module.exports = router