const express = require('express')
const router = express.Router()
const { checkLogin, checkAdmin } = require('../configs/passport')
const { User, Phrase, Doutrine } = require('../models/aconselhadorModel')
const { body, validationResult } = require('express-validator')

// Admin operations

// Dashboard
router.get('/admin/dashboard', checkLogin, checkAdmin, async (req, res) => {
    db_phrases = await Phrase.findAll()
    count_phrases = await Phrase.count()
    db_doutrines = await Doutrine.findAll()
    count_doutrines = await Doutrine.count()
    db_users = await User.findAll()
    count_users = await User.count()
    
    phr = db_phrases.map(items => items.toJSON())
    dout = db_doutrines.map(items => items.toJSON())
    users = db_users.map(items => items.toJSON())

    res.render('dashboard', {
        db_phrases: phr, 
        db_doutrines: dout, 
        count_phrases: count_phrases, 
        count_doutrines: count_doutrines,
        db_users: users,
        count_users: count_users,
        title: "Aconselhador Bíblico | Dashboard",
    })
})

// Add
router.get('/add', checkLogin, checkAdmin, (req, res) => {
    res.render('addform', {
        title: "Aconselhador Bíblico | Add",
    })
})

// Output
router.get('/output', (req, res) => {
    res.render('output', {
        title: "Aconselhador Bíblico | Output",
    })
})

// Add Phrase
router.post(
    '/add-phrase',
    [
        body('phrase').trim().notEmpty().withMessage('A frase é obrigatório!'),
        body('versicle').trim().notEmpty().withMessage('O verso é obrigatório!'),
    ],
    async (req, res) => {
        const errors = validationResult(req);

        // Verificar erros de validação
        if (!errors.isEmpty()) {
            return res.render('output', {
                error: errors.array().map(err => err.msg).join(' '),
            });
        }

        const { phrase, versicle } = req.body;

        try {
            const [newDoutrine, created] = await Phrase.findOrCreate({
                where: { phrase },
                defaults: { versicle: versicle },
            });

            if (created) {
                return res.render('output', { success: 'Frase adicionada com sucesso!' });
            } else {
                return res.render('output', { error: 'Essa frase já existe!' });
            }
        } catch (error) {
            console.error('Erro ao criar frase:', error);
            return res.render('output', {
                error: 'Ocorreu um erro ao atualizar a tabela. Tente novamente mais tarde!',
            });
        }
    }
);
// Add Doutrine
router.post(
    '/add-doutrine',
    [
        body('title').trim().notEmpty().withMessage('O título é obrigatório!'),
        body('content').trim().notEmpty().withMessage('O conteúdo é obrigatório!'),
    ],
    async (req, res) => {
        const errors = validationResult(req);

        // Verificar erros de validação
        if (!errors.isEmpty()) {
            return res.render('output', {
                error: errors.array().map(err => err.msg).join(' '),
            });
        }

        const { title, content } = req.body;

        try {
            const [newDoutrine, created] = await Doutrine.findOrCreate({
                where: { title },
                defaults: { text: content },
            });

            if (created) {
                return res.render('output', { success: 'Doutrina adicionada com sucesso!' });
            } else {
                return res.render('output', { error: 'Essa doutrina já existe!' });
            }
        } catch (error) {
            console.error('Erro ao criar doutrina:', error);
            return res.render('output', {
                error: 'Ocorreu um erro ao atualizar a tabela. Tente novamente mais tarde!',
            });
        }
    }
);
// Edit
router.get('/edit', checkLogin, checkAdmin, async (req, res) => {
    phrases = await Phrase.findAll()
    doutrines = await Doutrine.findAll()

    phr = phrases.map(items => items.toJSON())
    dout = doutrines.map(items => items.toJSON())

    res.render('editform', {phrases: phr, doutrines: dout, title: "Aconselhador Bíblico | Edit",})
})

// Edit Content
router.get('/form-to-edit/:id', checkLogin, checkAdmin, async (req, res) => {
    const id = req.params.id
    const table = req.query.tagId

    try {
        if (table == 'phrase'){
            // Phrase
            targetTable = await Phrase.findByPk(id)
            converted = targetTable.toJSON()

        } else if (table == 'doutrine'){
            // Doutrine
            targetTable = await Doutrine.findByPk(id)
            converted = targetTable.toJSON()

        }
        // Render form to edit
        return res.render('form-to-edit', {targetTable: converted, title: `Aconselhador Bíblico | Editing ${id}`,})
         
    } catch (e) {
        res.redirect('/')
    }
})
router.post('/saveEdited', async (req, res) => {        
    const data = req.body
    const id = data.itemID
    const table = data.target
    
   if (table == 'phrase'){
        const newinput = data.inputphr
        const newtext = data.textphr

        if (newinput != "" && newtext != ""){
            await Phrase.update({
                phrase: newtext,
                versicle: newinput
            }, {where: {id: id}})
            .then(() => res.render('output', {success: 'Tabela atualizada com sucesso!'})).catch(() => res.render('output', {error: 'Ocorreu um erro ao atualizar a tabela!'}))
        }
        
    }
    else if (table == 'doutrine'){
        const newinput = data.inputdout
        const newtext = data.textdout

        if (newinput != "" && newtext != ""){
            await Doutrine.update({
                title: newinput,
                text: newtext
            }, {where: {id: id}})
            return res.render('output', {success: 'Tabela atualizada com sucesso!'})
        }
    }
})

// Delete
router.get('/delete', checkLogin, checkAdmin, async (req, res) => {
    phrases = await Phrase.findAll()
    doutrines = await Doutrine.findAll()

    phr = phrases.map(items => items.toJSON())
    dout = doutrines.map(items => items.toJSON())

    res.render('deleteform', {phrases: phr, doutrines: dout})
})
router.post('/delete', async (req, res) => {
    const data = req.body

    const id = data.id
    const action = data.header

    if (action == 'phrase'){
        await Phrase.destroy({where: {'id': id}}).then(() => res.render('output', {success: 'Tabela atualizada com sucesso!'})).catch(() => res.render('output', {error: 'Ocorreu um erro ao atualizar a tabela!'}))
    }
    else if (action == 'doutrine'){
        await Doutrine.destroy({where: {'id': id}}).then(() => res.render('output', {success: 'Tabela atualizada com sucesso!'})).catch(() => res.render('output', {error: 'Ocorreu um erro ao atualizar a tabela!'}))
    }
})

module.exports = router