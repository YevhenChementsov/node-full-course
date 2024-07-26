const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const authRouter = require('./routes/auth');
const contactsRouter = require('./routes/contacts');
const usersRouter = require('./routes/users');

const app = express();

app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/users', usersRouter);

app.use((_, res) => {
  res
    .status(404)
    .json({ message: 'Route not found. Use api on routes: /api/contacts' });
});

app.use((err, req, res, next) => {
  const { status = 500, message = 'Server error' } = err;
  res.status(status).json({ message });
});

module.exports = app;
