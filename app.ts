require('dotenv').config();

const fs = require('fs'),
  http = require('http'),
  https = require('https'),
  express = require('express'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  mongodb = require('mongodb'),
  MongoClient = mongodb.MongoClient,
  nodemailer = require('nodemailer'),
  stripe = require('stripe')(process.env.STRIPE_KEY),
  colors = require('colors/safe');

// Environment
let nodeTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});

let app = express()
  .use(cors())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(express.static(__dirname + '/dist/nemis'))
  .use('/success', express.static(__dirname + '/server', { index: 'success.html' }))
  .post('/checkout', async (req, res) => {
    let line_items = [];
    req.body.forEach((item: any) => {
      line_items.push({
        price: item.id,
        quantity: item.quantity
      });
    });
    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: 'payment',
      success_url: `https://${process.env.DOMAIN}/success`,
      cancel_url: `https://${process.env.DOMAIN}`
    });

    res.send(session.url);
  })
  .post('/contact', (req, res) => {
    nodeTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'nemisnight@gmail.com',
      subject: `New Message ${(new Date).getTime()}`,
      html: `<p>From: <b>${req.body.firstName} ${req.body.lastName}</b></p>
      <p>Email: <b>${req.body.email}</b></p>
      <br><hr><br>
      <p>Message:</p><br>
      <pre><i>${req.body.message}</i></pre>`
    });
    res.redirect("https://" + process.env.DOMAIN);
  });

// Hosting server

const sslOptions = {
  key: fs.readFileSync(__dirname + '/sslCertificate/key.pem'),
  cert: fs.readFileSync(__dirname + '/sslCertificate/cert.pem')
};

http
  .createServer((req, res) => {
    res.writeHead(301, { Location: `https://${process.env.DOMAIN}` });
    res.end();
  })
  .listen(80);

https.createServer(sslOptions, app).listen(443);

console.clear();
console.log('----------------------------------------------\n');
console.log(colors.green('Server running on ports 80 and 443 ✅\n'));
console.log(colors.yellow(`Website: https://${process.env.DOMAIN} ⭐\n`));
console.log('--------------------------------------------------------\n\n');
