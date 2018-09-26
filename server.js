'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const expect      = require('chai').expect;
const cors        = require('cors');
const helmet    = require('helmet');
const MongoClient = require('mongodb').MongoClient;

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet({
  hidePoweredBy: {
    setTo: 'PHP 4.2.0'
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "https://hyperdev.com", "https://cdn.gomix.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://code.jquery.com"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  noCache: true
}));

MongoClient.connect(process.env.DB, (err, db) => {
  if (err) {
    console.log(err);
  } else {
    console.log('successful database connection');
    //Index page (static HTML)
    app.route('/')
      .get(function (req, res) {
        res.sendFile(process.cwd() + '/views/index.html');
      });

    //For FCC testing purposes
    fccTestingRoutes(app);

    //Routing for API 
    apiRoutes(app, db);  

    //404 Not Found Middleware
    app.use(function(req, res, next) {
      res.status(404)
        .type('text')
        .send('Not Found');
    });

    //Start our server and tests!
    app.listen(process.env.PORT || 3000, function () {
      console.log("Listening on port " + process.env.PORT);
      if(process.env.NODE_ENV==='test') {
        console.log('Running Tests...');
        setTimeout(function () {
          try {
            runner.run();
          } catch(e) {
             const error = e;
              console.log('Tests are not valid:');
              console.log(error);
          }
        }, 3500);
      }
    });  
  }
});

module.exports = app; //for testing
