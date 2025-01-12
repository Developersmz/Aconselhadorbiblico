require('dotenv').config()

const express = require('express')
const handlebars = require('express-handlebars')
const passport = require('passport')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const app = express()
const bodyParser = require('body-parser')

const selectMultiplePhrasesAndDoutrines = require('./utils/utils')
const schedule = require('node-schedule')

const port = 3000

// Sessions
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})

app.use(session({
    key: 'sessionsaconselhadorbiblicokey',
    secret: process.env.SECRET_SESSION || 'thisismysecretsessionkeyforaconselhadorbiblico2024',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}))

// schedule content update (00:00)
schedule.scheduleJob('*/1 * * * *', async () => {
    try {
        await selectMultiplePhrasesAndDoutrines();
    } catch (error) {
        console.error('Erro na execução do agendamento de teste: ', error);
    }
});

const hdbs = handlebars.create({
    helpers: {
        truncate: function (text, length) {
            if (typeof text === 'string' && text.length > length) {
                return text.substring(0, length) + '...';
            }
            return text || '';
        }
    }
});

const hbs = handlebars.create({ defaultLayout: 'main' }, {allowProtoMethodsByDefault: true})
app.engine('handlebars', hbs.engine)
app.engine('handlebars', hdbs.engine)
app.set('view engine', 'handlebars')

app.use(passport.initialize())
app.use(passport.session())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Importar as rotas
const routes = require('./routes/routes')
const auth = require('./routes/auth')
const admin = require('./routes/admin')
const counsel = require('./routes/counsel')

app.use('/', routes)
app.use('/auth', auth)
app.use('/aconselhadorbiblico', admin)
app.use('/counsel', counsel)

app.listen(port || 3000, () => {
    console.log('SERVER ARE RUNNING NORMALY...')
})

