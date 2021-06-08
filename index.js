const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
require('dotenv').config();

const express = require ('express');

const app = express();
const port = process.env.PORT || 8765;
app.use(express.json());

app.listen(port, () => {
  console.log(`Starting server at ${port}`);
});


app.get('/:number/:message', (request, response) => {
  console.log(request.params.number);
  console.log(request.params.message);

  const number = request.params.number + '@c.us';
  const mesg   = request.params.message;

  //  response.send(request.params);


  // Path where the session data will be stored
  const SESSION_FILE_PATH = './session.json';

  // Load the session data if it has been previously saved
  let sessionData;
  if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
  }

  // Use the saved values
  const client = new Client({
    session: sessionData
  });

  //const client = new Client();
  client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
  });

  // Save session values to the file upon successful auth
  client.on('authenticated', (session) => {
    console.log('authenticated');
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
      if (err) {
        console.error(err);
      }
    });
  });

  client.on('message', async msg => {
    console.log('MESSAGE RECEIVED', msg);
  });


  client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
  });

  client.on('ready', () => {
    console.log('Client is ready!');
    try {
      client.sendMessage(number,mesg)
        .then(mesaje => {
          console.log('message sent: ' + mesaje);
          response.send('message sent: ' + JSON.stringify(mesaje));
        })
        .catch(error => {
          console.log(error);
          response.send('Message not sent ' + error);
        })
    }
    catch(err){
      console.log('err: ' + err);
    }
  });


  client.initialize();


});
