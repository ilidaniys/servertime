const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const User = require('./model/user')
const app = express();
const addAuth = require('./route/auth')
// const varMiddleware = require('./middleware/variebles')
const authMiddleware = require('./middleware/authentificateToken')

const port = process.env.PORT || 5000;
const URI = `mongodb+srv://Andreu:7xZ02jGyp84AfgQv@cluster0.tb5v8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));


app.use('/', addAuth)

app.get('/api/hello', (req, res) => {
    res.send({express: 'Hello From Express'});
});

app.get('/api/profile', authMiddleware, async (req, res) => {
    const email = req.userEmail.email
    const user = await User.findOne({email})
    console.log('user', user)
    if (!user) {
        res.status(401)
        console.log('email err', email)
    }
    user.amount()
    res.send(user)
    // console.log('user', user)
});

app.get('/api/adminList', authMiddleware, async (req, res) => {
    const email = req.userEmail.email
    const user = await User.findOne({email})
    if (user.userRole === 'admin') {
        const userList = await User.find()
        console.log('userList', userList)
        res.send(userList);
    }
});

app.get('/api/adminList/profile:id', authMiddleware, async (req, res) => {
    const userId = req.params.id
    console.log('user id', req.params.id)
    const user = await User.findById(userId)
    console.log('user find', user)
    res.send(user);
});

app.post('/api/startTime', authMiddleware, async (req, res) => {

    const email = req.userEmail.email
    const user = await User.findOne({email})
    await user.startTime(req.body)
    res.send(
        `I received your POST request. This is what you sent me: ${req.body.post}`,
    );
});

app.get('/api/refreshStart', authMiddleware, async (req, res) => {
    const email = req.userEmail.email
    const user = await User.findOne({email})
    if (user || null) {
        const unfinishedSession = () => {
            return user.sessions.session.find(session => {
                if (session.startTime !== 0 && session.endTime === '0') {
                    console.log('checkMetod', session)
                    return session
                }
                return null
            })
        }
        const adminRole = (user.userRole === 'admin')
        const response = {
            unSession: unfinishedSession(),
            adminRole
        }
        res.send(response)
    }

})

app.post('/api/endTime', authMiddleware, async (req, res) => {
    console.log('req endTime', req.body);
    const email = req.userEmail.email
    const user = await User.findOne({email})
    await user.endTime(req.body)
    res.send(
        `I received your POST request. This is what you sent me: ${req.body.post}`,
    );
});


async function start() {
    try {
        await mongoose.connect(URI)
        app.listen(port, () => console.log(`Listening on port ${port}`));
    } catch (e) {
        console.log(e)
    }
}

start()

