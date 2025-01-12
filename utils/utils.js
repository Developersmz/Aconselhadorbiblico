const { Phrase, Doutrine, ContentCache } = require('../models/aconselhadorModel')
const db = require('../models/db')
const { Sequelize } = require('sequelize');

const selectMultiplePhrasesAndDoutrines = async () => {
    console.log('Função selectMultiplePhrasesAndDoutrines foi chamada');

    try {
        // Seleciona 5 frases aleatórias
        const phrases = await Phrase.findAll({
            order: Sequelize.literal('RAND()'),
            limit: 10,
        });

        // Seleciona 5 doutrinas aleatórias
        const doutrines = await Doutrine.findAll({
            order: Sequelize.literal('RAND()'),
            limit: 10,
        });

        // Atualiza o cache para frases
        await ContentCache.destroy({ where: { type: 'Phrase' } });
        for (const phrase of phrases) {
            await ContentCache.create({
                type: 'Phrase',
                referenceId: phrase.id,
            });
        }

        // Atualiza o cache para doutrinas
        await ContentCache.destroy({ where: { type: 'Doutrine' } });
        for (const doutrine of doutrines) {
            await ContentCache.create({
                type: 'Doutrine',
                referenceId: doutrine.id,
            });
        }
        console.log('Novas frases e doutrinas carregadas no cache.');
    
    } catch (error) {
        console.error('Erro ao carregar frases e doutrinas no cache:', error);
    }
};


module.exports = selectMultiplePhrasesAndDoutrines