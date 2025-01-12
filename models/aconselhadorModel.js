const db = require('./db')
const { DataTypes, sequelize, Model } = require('sequelize')
const bcrypt = require('bcryptjs')

const User = db.sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: true
})

const Phrase = db.sequelize.define('Phrase', {
    phrase: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    versicle: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

const Doutrine = db.sequelize.define('Doutrine', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    }
})
const ContentCache = db.sequelize.define('ContentCache', {
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    referenceId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})
const CounselHistory = db.sequelize.define('CounselHistory', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    searchQuery: {
        type: DataTypes.STRING,
        allowNull: false
    },
    result: {
        type: DataTypes.TEXT,
        allowNull: false
    }

})

const Book = db.sequelize.define('Book', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    abrev: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

const Chapter = db.sequelize.define('Chapter', {
    chapternum: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

const Verse = db.sequelize.define('Verse', {
    versenum: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    indexes: [
        {
            type: 'FULLTEXT',
            fields: ['text']
        }
    ]
})

const Theme = db.sequelize.define('Theme', {
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    }
});

const VerseTheme = db.sequelize.define('VerseTheme', {});

ContentCache.belongsTo(Phrase, { foreignKey: 'referenceId', constrains: false, as: 'phrase' })
ContentCache.belongsTo(Doutrine, { foreignKey: 'referenceId', constrains: false, as: 'doutrine' })
Phrase.hasMany(ContentCache, { foreignKey: 'referenceId', constrains: false, as: 'cache' })
Doutrine.hasMany(ContentCache, { foreignKey: 'referenceId', constrains: false, as: 'cache' })

Book.hasMany(Chapter, { foreignKey: 'bookId' })
Chapter.belongsTo(Book, { foreignKey: 'bookId' })
Chapter.hasMany(Verse, { foreignKey: 'chapterId' })
Verse.belongsTo(Chapter, { foreignKey: 'chapterId' })
Verse.belongsToMany(Theme, {through: VerseTheme, foreignKey: 'verseId'})
Theme.belongsToMany(Verse, {through: VerseTheme, foreignKey: 'themeId'})


User.beforeCreate(async (user) => {
    const hash = await bcrypt.hash(user.password, 10)
    user.password = hash
})

db.sequelize.sync({ alter: true }).then(() => console.log("Banco de dados modificado")).catch((err) => console.log("Ocorreu um erro ao modificar a tabela: " + err))

module.exports = {
    User: User,
    Phrase: Phrase,
    Doutrine: Doutrine,
    ContentCache,
    CounselHistory,
    Book, 
    Chapter,
    Verse,
    Theme,
    VerseTheme
}
