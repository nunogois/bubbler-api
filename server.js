/* REQUIRES */
import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { connect, set, model } from 'mongoose';

/* CONFIG */
require('dotenv').config();
connect(process.env.MONGO, { useNewUrlParser: true, dbName: 'bubbler' });
set('useFindAndModify', false);

/* MODULES */
import { passport, google_login, google_callback, generateToken, check } from './session';

const app = express();

/* SOCKET.IO */
const http = require('http').createServer(app);
const io = require('socket.io')(http);
import { authorize } from 'socketio-jwt';

let io_users = [];

io.use(authorize({
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
app.use(json());
app.use(cors());
app.use(passport.initialize());

/* MODELS */
const chat = mongoose.model('chat', { id: String, updated: Date, users: [], messages: [] });

/* ROUTES */
app.get('/', function(req, res) {
	res.send('<h1>Welcome to the Bubbler API!</h1><br><a href="https://bubbler.netlify.com">https://bubbler.netlify.com</a>');
});

app.get('/auth/google', google_login);

app.get('/auth/google/callback', google_callback, function(req, res) {
	req.token = generateToken(req.user);
	res.redirect('https://bubbler.netlify.com/?token=' + req.token);
})

app.get('/load', check, async function(req, res) {
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