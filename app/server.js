var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var config = require('./config');
var ssoClient = require('./util/ssoClient');
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

app.use(ssoClient({
  identityProvider: {
    authUrl: 'http://localhost:3001/auth?target=${TARGET}',
    getIdUrl: 'http://localhost:3001/id.json/${SSO_TOKEN}'
  },
  appTarget: 'http://localhost:3010'
}));

app.get('/', test.home);

app.use(bodyParser.urlencoded({
  extended: false
}));


app.listen(config.port, function() {
  console.log('Single-Sign-On Service Provider app listening on port ' + config.port + ' ...');
});
