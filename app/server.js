var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var request = require('request');
var config = require('./config');
var test = require('./util/test');

// base directory for view templates
global.viewBaseDir = __dirname + '/views';


// ----------------------------------------------------
var app = express();
var sessionStore; // ?TODO where do I get the session store instance from?


app.use(session({
  name: 'ssoSessionId',
  resave: false,
  saveUninitialized: false,
  secret: 'sso-secret-ssshhhhh',
  store: sessionStore
}));

app.use(function(req, res, next) {
  console.log('check for SSO token ...');
  // check if we got an SSO token
  if (!req.query.ssoSessionId) {
    next();
  }

  console.log(' --> YES, got SSO token!');
  //req.session.username = 'got SSO token: ' + req.query.ssoSessionId;

  // fetch user info
  console.log(' --> fetching user info ...');
  request('http://localhost:3001/id.json/' + req.query.ssoSessionId, function(err, response, data) {
    if (!err && response.statusCode == 200) {
      console.log(' --> GOT user info: ' + JSON.stringify(data));
      req.session.username = 'USER' + data.username;
    } else {
      console.log(' --> ERROR at fetching user info');
    }

    next();
  });
});

app.use(function(req, res, next) {
  console.log('check if session is there ...');
  // check if session is there
  if (req.session && req.session.username) {
    console.log(' --> YES, session there!');
    next();
    return;
  }

  // ask SSO identity provider for identity
  res.redirect('http://localhost:3001/auth?target=' + encodeURIComponent('http://localhost:3010'));
});

app.get('/', test.home);

app.use(bodyParser.urlencoded({
  extended: false
}));


app.listen(config.port, function() {
  console.log('Single-Sign-On Service Provider app listening on port ' + config.port + ' ...');
});
