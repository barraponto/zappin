
/*
 * GET home page.
 */

  var fs = require('fs')
    , request = require('request');
exports.index = function(req, res) {
  fs.readFile(__dirname + '/../web/index.html', 'utf-8', function(err, contents){
    if (err) throw err;
    res.send(contents);
  })
};

exports.twittercheck = function(req, res, next) {
  request({
    url: 'https://api.twitter.com/1/users/lookup.json',
    qs: {
      screen_name: req.params.username
    }
  }, function(error, response, body){
    if (response.statusCode == '200') {
      res.local('userdata', JSON.parse(body));
      next();
    } else if ( response.statusCode == '404') {
      data = JSON.parse(body);
      if (data.errors) {
        data.errors.filter(function(element, index, array){
          if (element.code == 34) {
            res.json(element, 404);
          }
        })
      }
    } else {
      console.log('[' + response.statusCode + ']:' + req.url);
      res.send('Vixe', 500);
    }
  });
}

exports.twitterdata = function(req, res) {
}
