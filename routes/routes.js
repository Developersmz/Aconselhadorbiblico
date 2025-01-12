require('dotenv').config()

const express = require('express')
const nodemailer = require('nodemailer')
const router = express.Router()
const fs = require('fs')
const xml2js = require('xml2js')
const path = require('path')
const { sequelize } = require('../models/db')
const { User, Book, Chapter, Verse, Phrase, Doutrine, ContentCache } = require('../models/aconselhadorModel')

// Config Middleware
router.use(express.urlencoded({ extended: true }))
router.use(express.json())

// Insert Bible
// router.get('/insert', async (req, res) => {
//   const processBibleXml = async (filePath) => {
//     try {
//         // Lendo e parseando o arquivo XML
//         const xmlData = fs.readFileSync(filePath, 'utf8');
//         const parser = new xml2js.Parser();
//         const result = await parser.parseStringPromise(xmlData);

//         // Acessando a lista de livros
//         const books = result.bible?.book || [];
//         if (books.length === 0) {
//             console.error('Não foi possível encontrar a lista de livros.');
//             return;
//         }

//         // Iniciando uma transação no banco de dados
//         await sequelize.transaction(async (transaction) => {
//             for (const book of books) {
//                 const bookName = book.$.name.trim();
//                 const bookAbbrev = book.$.abbrev.trim();

//                 // Criando ou encontrando o livro
//                 const [createdBook, created] = await Book.findOrCreate({
//                     where: { 
//                         name: bookName,
//                         abrev: bookAbbrev
//                     },
//                     defaults: { createdAt: new Date(), updatedAt: new Date() },
//                     transaction
//                 });

//                 if (created) {
//                     console.log(`Livro ${bookName} inserido com sucesso.`);
//                 } else {
//                     console.log(`Livro ${bookName} já existe.`);
//                 }

//                 const chapters = book.c || [];

//                 // Processando cada capítulo
//                 for (const chapter of chapters) {
//                     const chapterNumber = parseInt(chapter.$.n, 10);

//                     // Criando ou encontrando o capítulo
//                     const [createdChapter] = await Chapter.findOrCreate({
//                         where: {
//                             chapternum: chapterNumber,
//                             bookId: createdBook.id
//                         },
//                         defaults: { createdAt: new Date(), updatedAt: new Date() },
//                         transaction
//                     });

//                     // let chapterId = chapterNumber
//                     const versesToInsert = [];

//                     // Adicionando versículos ao capítulo atual
//                     for (const verse of chapter.v || []) {
//                         const verseNumber = parseInt(verse.$.n, 10);
//                         const verseText = verse._.trim();

//                         versesToInsert.push({
//                             versenum: verseNumber,
//                             text: verseText,
//                             createdAt: new Date(),
//                             updatedAt: new Date(),
//                             chapterId: createdChapter.id
//                         });
//                     }

//                     // Inserindo versículos em lote para o capítulo atual
//                     const BATCH_SIZE = 50;
//                     for (let i = 0; i < versesToInsert.length; i += BATCH_SIZE) {
//                         const batch = versesToInsert.slice(i, i + BATCH_SIZE);
//                         try {
//                             await Verse.bulkCreate(batch, { transaction });
//                             console.log(`Inserido lote de ${batch.length} versículos para o capítulo ${chapterNumber} do livro ${bookName}`);
//                         } catch (err) {
//                             console.error(`Erro ao inserir lote de versículos no capítulo ${chapterNumber} do livro ${bookName}: ${err.message}`);
//                         }
//                     }
//                 }
//             }
//       });
  
//       console.log('Bíblia inserida com sucesso no banco de dados!');
//     } catch (error) {
//       console.error('Erro ao processar o arquivo XML:', error);
//     }
//   };
  
//   // Executa o script
//   const filePath = path.join(__dirname, '../acf.min.xml');
//   await processBibleXml(filePath);
  
//   res.send('Processamento da Bíblia iniciado. Verifique os logs para detalhes.');
// });

// Rota inicial
router.get('/', async (req, res) => {
    
    let currentYear = new Date().getFullYear()
    const userId = req.session.userId
    let user = ""

    if (userId) {
        user = await User.findByPk(userId)
    }

    try {
        // Busca o cache
        const cachedPhrases = await ContentCache.findAll({
            where: { type: 'Phrase' },
            include: { model: Phrase, as: 'phrase' },
        });

        const cachedDoutrines = await ContentCache.findAll({
            where: { type: 'Doutrine' },
            include: { model: Doutrine, as: 'doutrine' },
        });

        // Mapeia os resultados para arrays de JSON
        const phrases = cachedPhrases.map((cache) => cache.phrase.toJSON());
        const doutrines = cachedDoutrines.map((cache) => cache.doutrine.toJSON());

        res.render('index', 
            { db_phrases: phrases.length ? phrases : [], 
              db_doutrines: doutrines.length ? doutrines : [], 
              user: user ? user.dataValues : null,
              title: "Aconselhador Bíblico | Conselho Diário",
              currentYear,
        })
    } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        res.status(500).send('Erro interno do servidor');
    }
    
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
