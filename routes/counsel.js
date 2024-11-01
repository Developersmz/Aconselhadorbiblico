const express = require('express')
const router = express.Router()
const { Book, Chapter, Verse, CounselHistory, Theme, VerseTheme } = require('../models/aconselhadorModel')
const { QueryTypes, where} = require('sequelize')
const { sequelize } = require('../models/db')
const { checkLogin, checkAdmin } = require('../configs/passport')

// Create new counseling
router.get('/addcounseling', checkLogin, (req, res) => {
    res.render('addcounseling')
})

// Associate verses
router.get('/syncThemes', checkLogin, checkAdmin, async (req, res) => {
    try {
        const themeKeywords = {
            "fé": [
                "confiança", "acreditar", "fé", "esperança", "crença", "devocional", 
                "otimismo", "lealdade", "fidelidade", "reverência", "respeito", 
                "dependência", "submissão", "piedade", "obediência", "segurança",
                "oração", "graça", "milagre", "redenção", "salvação", "intercessão", 
                "adoração", "santidade", "sacrifício", "humildade", "inspiração", 
                "esperança futura", "vitória", "fortalecimento", "refúgio", "justiça"
            ],
            "esperança": [
                "esperança", "otimismo", "expectativa", "confiança", "alegria", 
                "motivação", "renovação", "possibilidade", "luz", "propósito", 
                "renascimento", "redenção", "cura", "futuro", "fé", "convicção", 
                "fortaleza", "visão", "vontade de viver", "ânimo", "reconstrução"
            ],
            "sabedoria": [
                "sabedoria", "conhecimento", "entendimento", "discernimento", "inteligência", 
                "prudência", "reflexão", "juízo", "razão", "equilíbrio", "percepção", 
                "maturidade", "experiência", "sagacidade", "insight", "claridade",
                "compreensão", "orientação", "conselho", "ensinamento", "aprendizado", 
                "insight", "análise", "ponderação", "revelação", "verdade", "perspicácia", 
                "juízo moral", "autocontrole", "avaliação", "acerto", "direção"
            ],
            "pecado": [
                "pecado", "erro", "falha", "culpa", "transgressão", "falta", 
                "desobediência", "maldade", "iniquidade", "tentação", "imoralidade", 
                "arrependimento", "remorso", "perdição", "desvio", "impureza"
            ],
            "salvação": [
                "salvação", "redenção", "perdão", "libertação", "cura", 
                "sacrifício", "graça", "eternidade", "vida eterna", "refúgio", 
                "proteção", "aceitação", "paz", "transformação", "nova vida"
            ],
            "arrependimento": [
                "arrependimento", "remorso", "contrição", "reconciliação", 
                "confissão", "perdão", "redenção", "conversão", "mudança", 
                "renovação", "humildade", "aceitação", "transformação", "recomeço"
            ],
            "espírito santo": [
                "espírito santo", "consolo", "sabedoria divina", "guia", "força", 
                "poder", "presença de Deus", "dons", "frutos do espírito", 
                "santificação", "comunhão", "inspiração", "intercessão", "conhecimento"
            ],
            "anjos": [
                "anjos", "mensageiros", "guardiões", "protetores", "seres celestiais", 
                "ajuda", "consoladores", "servidores de Deus", "intercessores", "arcanjos", 
                "guerreiros espirituais", "vigilantes", "orientação", "luz", "paz"
            ],
            "morte": [
                "morte", "fim da vida", "partida", "passagem", "descanso eterno", 
                "luto", "eternidade", "reunião", "vida após a morte", "resurreição", 
                "despedida", "esperança futura", "memória", "redenção", "paz eterna"
            ],
            "satanás": [
                "satanás", "tentação", "inimigo", "enganador", "maldade", 
                "pecado", "príncipe das trevas", "oposição", "adversário", "acusações", 
                "perdição", "destruição", "iniquidade", "tentador", "mentiras"
            ],
            "família": [
                "família", "amor", "suporte", "cuidado", "respeito", 
                "educação", "união", "segurança", "pais", "filhos", 
                "relacionamentos", "valores", "proteção", "responsabilidade", "amizade"
            ],
            "namoro": [
                "namoro", "amor", "relacionamento", "companheirismo", "amizade", 
                "compromisso", "respeito", "cuidado", "afeição", "escolha", 
                "tempo", "conhecer", "compaixão", "lealdade", "união"
            ],
            "mulher": [
                "mulher", "sabedoria", "força", "maternidade", "valentia", 
                "compaixão", "cuidado", "honra", "dignidade", "amor", 
                "bondade", "fé", "sabedoria", "paciência", "resiliência"
            ],
            "adulterio": [
                "adultério", "infidelidade", "traição", "imoralidade", 
                "pecado", "desobediência", "promiscuidade", "tentação", 
                "culpa", "falta de compromisso", "perdição", "arrependimento"
            ],
            "fornicação": [
                "fornicação", "luxúria", "imoralidade", "desejo", 
                "pecado", "tentação", "carne", "paixão", "pecaminoso", 
                "arrependimento", "purificação", "redenção"
            ],
            "Jesus": [
                "Jesus", "salvador", "Cristo", "messias", "amor", 
                "redenção", "salvação", "graça", "perdão", "fé", 
                "milagre", "paz", "esperança", "verdade", "luz", 
                "cura", "compaixão", "justiça", "vida eterna", "sacrifício"
            ],
            "adoração": [
                "adoração", "louvor", "oração", "glorificação", 
                "respeito", "honra", "devoção", "reverência", "entrega", 
                "santidade", "consagração", "exaltação", "serviço", "veneração"
            ],
            "testemunho": [
                "testemunho", "fé", "experiência", "salvação", "história de vida", 
                "compartilhamento", "vitória", "cura", "transformação", "evangelização", 
                "honra", "glória", "livramento", "relato", "verdade"
            ],
            "tristeza": [
                "tristeza", "dor", "sofrimento", "lamento", "angústia", 
                "aflição", "perda", "melancolia", "isolamento", "vazio", 
                "decepção", "coração quebrantado", "lágrimas", "consolo", "esperança futura"
            ],
            "felicidade": [
                "felicidade", "alegria", "contentamento", "satisfação", 
                "júbilo", "ânimo", "celebração", "gratidão", "bem-estar", 
                "paz interior", "harmonia", "realização", "esperança", "amor"
            ],
            "vazio": [
                "vazio", "solidão", "falta", "ausência", "tristeza", 
                "insatisfação", "desânimo", "incompletude", "carência", 
                "desespero", "perda", "isolamento", "distância", "busca"
            ],
            "ambição": [
                "ambição", "ganância", "desejo", "objetivo", "prosperidade", 
                "sucesso", "esforço", "realização", "sonhos", "motivação", 
                "competição", "dedicação", "superação", "foco", "meta"
            ],
            "anticristo": [
                "anticristo", "engano", "oposição", "perversidade", 
                "falsidade", "iniquidade", "ameaça", "condenação", "adversário", 
                "escuridão", "mentiras", "influência", "apostasia"
            ],
        };
    
        // Obtenha todos os temas existentes
        const existingThemes = await Theme.findAll();
        const existingThemeNames = existingThemes.map(theme => theme.name);

        // Verifique quais temas ainda não estão no banco e crie-os
        const newThemes = Object.keys(themeKeywords)
            .filter(themeName => !existingThemeNames.includes(themeName))
            .map(themeName => ({ name: themeName }));

        if (newThemes.length > 0) {
            await Theme.bulkCreate(newThemes); // Cria todos os temas que não estão na tabela
        }

        // Atualize o mapeamento para incluir os novos temas
        const themes = await Theme.findAll();
        const themeMap = themes.reduce((map, theme) => {
            map[theme.name] = theme.id;
            return map;
        }, {});

        // Associe temas aos versículos
        const verses = await Verse.findAll();
        const associations = [];

        for (const verse of verses) {
            const verseText = verse.text.toLowerCase();

            for (const [themeName, keywords] of Object.entries(themeKeywords)) {
                if (keywords.some(keyword => verseText.includes(keyword))) {
                    const themeId = themeMap[themeName];
                    if (themeId) {
                        associations.push({
                            verseId: verse.id,
                            themeId: themeId,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        })
                    }
                }
            }
        }

        await VerseTheme.bulkCreate(associations);
        console.log("Temas associados aos versículos com sucesso.");
        res.send("Temas sincronizados e associados com sucesso.");
    } catch (error) {
        console.error("Erro ao associar temas aos versículos:", error);
        res.status(500).send("Erro ao associar temas aos versículos.");
    }
    
    
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
            return res.status(400).send('Dados incompletos para inserção.');
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

        res.send('Versículos inseridos com sucesso!')
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

        const results = await sequelize.query(`
            SELECT Books.name, Chapters.chapternum, Verses.versenum, Verses.text,
               MATCH(Verses.text) AGAINST(:state IN NATURAL LANGUAGE MODE) AS relevance,
               MATCH(Themes.name) AGAINST(:state IN NATURAL LANGUAGE MODE) AS theme_relevance
            FROM Verses
            JOIN Chapters ON Verses.chapterid = Chapters.id
            JOIN Books ON Chapters.bookid = Books.id
            LEFT JOIN VerseThemes ON Verses.id = VerseThemes.verseId
            LEFT JOIN Themes ON VerseThemes.themeId = Themes.id
            WHERE MATCH(Verses.text) AGAINST(:state IN NATURAL LANGUAGE MODE)
               OR MATCH(Themes.name) AGAINST(:state IN NATURAL LANGUAGE MODE)
            ORDER BY (relevance + IFNULL(theme_relevance, 0)) DESC
            LIMIT 20
            `, {
                replacements: { state },
                type: QueryTypes.SELECT
            })

            if (results.length === 0) {
                return res.render('counseling', { results: null, error: 'Ajuda não encontrada, tente novamente.' })
            }

            const uniqueResults = results.reduce((acc, current) => {
                const x = acc.find(item => item.versenum === current.versenum && item.chapternum === current.chapternum);
                if (!x) {
                    return acc.concat([current]);
                } else {
                    return acc;
                }
            }, []);


            await CounselHistory.findOrCreate({
                where: {
                    userId,
                    searchQuery: state
                },
                defaults: {
                    result: JSON.stringify(uniqueResults)
                }
            })

            res.render('counseling', { results: uniqueResults })

    } catch (error) {
        console.log(error)
        return res.render('counseling', { results: null, error: 'Ocorreu um erro. Tente novamente mais tarde.' })
    }
})


module.exports = router
