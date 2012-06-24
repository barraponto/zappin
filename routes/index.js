
/*
 * GET home page.
 */

exports.index = function(req, res){
  var fs = require('fs');
  fs.readFile(__dirname + '/../web/index.html', 'utf-8', function(err, contents) {
    if (err) throw err;
    res.send(contents);
  })
};
