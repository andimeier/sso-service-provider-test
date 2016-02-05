var request = require('request');

module.exports = exports = function(_config) {
  var config;

  config = _config;
  if (!config.identityProvider) {
    throw new Error('no SSO identity provider configured');
  }

  if (!config.identityProvider.authUrl) {
    throw new Error('no SSO identity provider authUrl configured');
  }

  if (config.identityProvider.authUrl.indexOf('${TARGET}') === -1) {
    throw new Error('no placeholder ${TARGET} found in identity provider authUrl [' + config.identityProvider.authUrl + ']');
  }

  if (!config.identityProvider.getIdUrl) {
    throw new Error('no SSO identity provider getIdUrl configured');
  }

  if (config.identityProvider.getIdUrl.indexOf('${SSO_TOKEN}') === -1) {
    throw new Error('no placeholder ${SSO_TOKEN} found in identity provider getIdUrl [' + config.identityProvider.getIdUrl + ']');
  }

  if (!config.appTarget) {
    throw new Error('no target URL configured');
  }

  return function (req, res, next) {
    ssoSession(req, res, next, config);
  }
}

/**
 * check for session data and if not there, use SSO mechanism to log user in
 * and retrieve the user info from the SSO identity provider
 */
function ssoSession(req, res, next, config) {
  var ssoToken = 'ssoSessionId'; // name of sso session ID parameter

  // if we have a session, everything is fine
  console.log('check if session is there ...'); // FIXME debugging output
  // check if session is there
  if (req.session && req.session.username) {
    console.log(' --> YES, session there!'); // FIXME debugging output
    next();
    return;
  }

  // no session there => SSO process kicks in ...

  // check if we got an SSO token
  console.log('check for SSO token ...'); // FIXME debugging output
  if (req.query[ssoToken]) {
    console.log(' --> YES, got SSO token: ' + req.query[ssoToken]); // FIXME debugging output

    // fetch user info
    console.log(' --> fetching user info ...'); // FIXME debugging output
    request(config.identityProvider.getIdUrl.replace('${SSO_TOKEN}', req.query[ssoToken]), function(err, response, data) {
      console.log(' --> response from id.json: ' + JSON.stringify(data)); // FIXME debugging output
      if (!err && response.statusCode == 200) {
        console.log(' --> GOT user info: ' + JSON.stringify(data)); // FIXME debugging output
        data = JSON.parse(data);
        req.session.username = 'USER' + data.username;
      } else {
        console.log(' --> ERROR at fetching user info (status code: ' + response.statusCode + ') with SSO token  ' + req.query[ssoToken]); // FIXME debugging output
      }

      next();
      return;
    });

  } else {
    // no SSO token and no session => ask SSO identity provider for identity
    console.log('no SSO token => redirect to SSO auth ...'); // FIXME debugging output
    res.redirect(config.identityProvider.authUrl.replace('${TARGET}', encodeURIComponent(config.appTarget)));
  }
}
