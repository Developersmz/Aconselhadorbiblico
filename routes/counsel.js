const express = require('express')
const router = express.Router()
const { Book, Chapter, Verse, CounselHistory } = require('../models/aconselhadorModel')
const { QueryTypes, where} = require('sequelize')
const { sequelize } = require('../models/db')
const { checkLogin } = require('../configs/passport')

// Create new counseling
router.get('/addcounseling', checkLogin, (req, res) => {
    res.render('addcounseling')
})

router.post('/add-counsel', async (req, res) => {
    try {
        const book = req.body.books;
        const chapters = req.body['chapters[]'];
        const versenums = req.body['versenums[]'];
        const texts = req.body['texts[]'];

        const [ foundBook, createdBook ] = await Book.findOrCreate({
            where: { name: book }
        })

        if (chapters.length !== versenums.length || versenums.length !== texts.length) {
            return res.status(400).send('<h3>Dados incompletos para inserção.</h3>');
        }

        const verses = []

        for (let i = 0; i < chapters.length; i ++) {
            const [ foundChapter, createdChapter ] = await Chapter.findOrCreate({
                where: { chapternum: chapters[i], bookId: foundBook.id }
            })
        
            verses.push({
                versenum: versenums[i],
                text: texts[i],
                chapterId: foundChapter.id
            })
        }
        await Verse.bulkCreate(verses)

        res.send('<h2>Versículos inseridos com sucesso!</h2>')
    } catch (e) {
        console.error('Erro ao inserir versículos em massa:', e);
        res.status(500).send('Erro ao inserir versículos.');
    }

})  

// Counseling a user & create history
router.get('/counseling', checkLogin, async (req, res) => {
    try {
        const userId = req.session.userId;
        const searchQuery = req.query.search;

        let history;
        
        if (searchQuery) {
            history = await CounselHistory.findAll({
                where: {
                    userId: userId,
                    searchQuery: searchQuery
                }
            });
        } else {
            history = await CounselHistory.findAll({ where: { userId: userId } });
        }

        // Converte o campo 'result' de string JSON para array em todos os itens de history
        history = history.map(item => {
            return {
                ...item.dataValues,
                result: JSON.parse(item.dataValues.result)
            };
        });

        res.render('counseling', { history }); 
    } catch (error) {
        console.error('Erro ao buscar o histórico:', error);
        res.status(500).send('Erro ao buscar o histórico.');
    }
});

router.get('/counseling/search', checkLogin, async (req, res) => {
    const userId = req.session.userId;
    const searchQuery = req.query.query;
  
    try {
      const history = await CounselHistory.findOne({
        where: {
          userId: userId,
          searchQuery: searchQuery
        }
      });
  
      if (history) {
        // Retorna o resultado como JSON
        const results = JSON.parse(history.result);
        res.json(results); // Envia os resultados como JSON
      } else {
        res.status(404).json({ error: 'Nenhum histórico encontrado para essa consulta.' });
      }
      
    } catch (error) {
      console.error('Erro ao buscar o histórico:', error);
      res.status(500).json({ error: 'Erro ao buscar o histórico.' });
    }
  });

router.post('/counseling', async (req, res) => {
    try {
        const { state } = req.body
        const userId = req.session.userId

        let history = await CounselHistory.findAll()

        history = history.map(items => items.toJSON())

        let existingHistory = await CounselHistory.findOne({
            where: { userId, searchQuery: state }
        })

        const results = await sequelize.query(`
            SELECT books.name, chapters.chapternum, verses.versenum, verses.text
            FROM Verses
            JOIN Chapters ON Verses.chapterid = Chapters.id
            JOIN Books ON Chapters.bookid = Books.id
            WHERE MATCH(Verses.text) AGAINST(:state IN NATURAL LANGUAGE MODE)
            `, {
                replacements: { state },
                type: QueryTypes.SELECT
            })

            if (results.length === 0) {
                return res.render('counseling', { results: null, error: 'Ajuda não encontrada, tente novamente.' })
            }

            if (!existingHistory) {
                await CounselHistory.create({
                    userId,
                    searchQuery: state,
                    result: JSON.stringify(results)
                })
            }
            res.render('counseling', { results })

    } catch (error) {
        console.log(error)
        return res.render('counseling', { results: null, error: 'Ocorreu um erro. Tente novamente mais tarde.' })
    }
})


module.exports = router
