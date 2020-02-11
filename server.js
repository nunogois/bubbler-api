/* REQUIRES */
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

/* CONFIG */
require('dotenv').config();
mongoose.connect(process.env.MONGO, { useNewUrlParser: true, dbName: 'bubbler' });
mongoose.set('useFindAndModify', false);

/* MODULES */
const session = require('./session');

const app = express();

/* SOCKET.IO */
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const iojwt = require('socketio-jwt');

let io_users = [];

io.use(iojwt.authorize({
  secret: process.env.JWT_SECRET,
  handshake: true
}));

io.on('connection', function (socket) {
  socket.join(socket.decoded_token.id);
  io.on('disconnect', () => {
    console.log('disconnected')
  })
})

/* USES */
app.use(bodyparser.json());
app.use(cors());
app.use(session.passport.initialize());

/* MODELS */
const chat = mongoose.model('chat', { id: String, updated: Date, users: [], messages: [] });

/* ROUTES */
app.get('/', function(req, res) {
	res.send('<h1>Welcome to the Bubbler API!</h1><br><a href="https://bubbler.netlify.com">https://bubbler.netlify.com</a>');
});

app.get('/auth/google', session.google_login);

app.get('/auth/google/callback', session.google_callback, function(req, res) {
	req.token = session.generateToken(req.user);
	res.redirect('https://bubbler.netlify.com/?token=' + req.token);
})

app.get('/load', session.check, async function(req, res) {
  res.json({ user: req.user, user_list: await chat.findOne({ id: req.user.id }) });
})

// app.post('/save', session.check, async function(req, res) {
// 	const new_list = { id: req.user.id, items: req.body.items, updated: new Date().toISOString() };
// 	await chat.findOneAndUpdate({ id: req.user.id }, new_list, { upsert: true });
// 	io.to(req.user.id).emit('save', req.body.items);
// 	res.sendStatus(200);
// })

app.post('/logout', function (req, res) {
	req.logout();
	res.sendStatus(200);
})

http.listen(process.env.PORT || 3000);