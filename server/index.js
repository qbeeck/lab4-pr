const express = require('express');
const Imap = require('imap');
const nodemailer = require('nodemailer');


// Создаем приложение
const app = express();

// Отключение CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  // Для запросов типа OPTIONS отправляем только заголовки и статус 204 No Content
  if (req.method === 'OPTIONS') {
    res.send(204);
  } else {
    next();
  }
});

app.get('/messages', (req, res) => {
  const imap = new Imap({
    user: 'qbeeckone@gmail.com',
    password: 'etgynopvhaudazmj',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: {
      servername: 'imap.gmail.com',
    }
  });

  function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
  }

  const messages = [];

  imap.once('ready', () => {
    openInbox((err, box) => {
      if (err) throw err;
      const fetchOptions = { bodies: ['HEADER', 'TEXT'] };
      const messageIds = box.messages.total - 19 + ':' + box.messages.total; // получить последние 10 сообщений
      const f = imap.seq.fetch(messageIds, fetchOptions);
      f.on('message', (msg, seqno) => {
        const message = {
          seqno: seqno,
          headers: {},
          body: ''
        };
        msg.on('body', (stream, info) => {
          let buffer = '';
          stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
          });
          stream.once('end', () => {
            if (info.which === 'HEADER') {
              message.headers = Imap.parseHeader(buffer);
            } else {
              message.body = buffer;
            }
          });
        });
        msg.once('end', () => {
          messages.push(message);
        });
      });
      f.once('error', (err) => {
        console.log('Fetch error: ' + err);
      });
      f.once('end', () => {
        imap.end();
        res.json(messages); // вернуть полученные сообщения в виде JSON
      });
    });
  });

  imap.once('error', (err) => {
    console.log(err);
  });

  imap.once('end', () => {
    console.log('Connection ended');
  });

  imap.connect();
});

app.get('/send', (req, res) => {
  const query = req.query;

  // Создаем транспорт для отправки письма через SMTP-сервер Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'qbeeckone@gmail.com',
      pass: 'etgynopvhaudazmj'
    }
  });

  // Определяем параметры письма
  const mailOptions = {
    from: 'qbeeckone@gmail.com',
    to: query.email,
    subject: 'Test Email',
    text: query.text
  };

  // Отправляем письмо
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.json({ sent: 'succesfful' });
    }
  });
})

// Запускаем сервер
app.listen(3000, () => {
  console.log('Сервер запущен!');
});
