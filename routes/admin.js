const express = require('express')
const router = express.Router()
const { checkLogin, checkAdmin } = require('../configs/passport')
const { User, Phrase, Doutrine } = require('../models/aconselhadorModel')

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
        count_users: count_users
    })
})

// Add
router.get('/add', checkLogin, checkAdmin, (req, res) => {
    res.render('addform')
})

// Output
router.get('/output', (req, res) => {
    res.render('output')
})

// Add Phrase
router.post('/add-phrase', checkLogin, checkAdmin, async (req, res) => {

    const data = {
        phrase: req.body.phrase,
        versicle: req.body.versicle
    }

    const numberEntries = await Phrase.count()

    if (numberEntries < 10) {
        await Phrase.create(data)
        .then(() => res.render('output', {success: 'Tabela atualizada com sucesso!'})).catch(() => res.render('output', {error: 'Ocorreu um erro ao atualizar a tabela!'}))
    } else {
        try {
            const lastEntry = await Phrase.findOne({
                order: [['id', 'ASC']]
            })
    
            if (lastEntry) {
                await Phrase.update(data, {
                    where: { id: lastEntry.id }
                })
                .then(() => res.render('output', {success: 'Tabela atualizada com sucesso!'})).catch(() => res.render('output', {error: 'Ocorreu um erro ao atualizar a tabela!'}))
            }
        } catch (error) {
            res.status(500).send('Error updating entry');
        }
    }
})
// Add Doutrine
router.post('/add-doutrine', async (req, res) => {
    const data = {
        title: req.body.title,
        text: req.body.content
    }

    const numberEntries =  await Doutrine.count()

    if (numberEntries < 5) {
        await Doutrine.create(data)
        .then(() => res.render('output', {success: 'Tabela atualizada com sucesso!'})).catch(() => res.render('output', {error: 'Ocorreu um erro ao atualizar a tabela!'}))
    } else {
        try {
            const lastEntry = await Doutrine.findOne({
                order: [['id', 'ASC']]
            })

            if (lastEntry) {
                console.log(data)
                await Doutrine.update(data, {
                    where: { id: lastEntry.id }
                })
                .then(() => res.render('output', {success: 'Tabela atualizada com sucesso!'})).catch(() => res.render('output', {error: 'Ocorreu um erro ao atualizar a tabela!'}))
            }
        } catch (error) {
            res.status(500).send('Error updating entry');
        }
    }
})
// Edit
router.get('/edit', checkLogin, checkAdmin, async (req, res) => {
    phrases = await Phrase.findAll()
    doutrines = await Doutrine.findAll()

    phr = phrases.map(items => items.toJSON())
    dout = doutrines.map(items => items.toJSON())

    res.render('editform', {phrases: phr, doutrines: dout})
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
        return res.render('form-to-edit', {targetTable: converted})
         
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