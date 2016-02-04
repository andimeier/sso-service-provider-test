var template = require('./template');

/**
 * @param {string} username
 * @param {string} password
 * @param {function} callback function with signature (err, data). err is the
  *   error string (in case of error), data is the auth object on success
 */
exports.home = function (req, res) {
  template.render(res, 'home.html', {
    username: req.session.username,
    message: 'Nothing new.'
  });
}
