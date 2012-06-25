
/*
 * GET home page.
 */

  var fs = require('fs')
    , request = require('request')
    , pos = require('pos')
    , _ = require('underscore')
    , blacklist = [
      // Preprositions
      'a', 'ante', 'após', 'até', 'com', 'contra', 'de', 'desde', 'em',
      'entre', 'para', 'por', 'perante', 'segundo', 'sem', 'sob', 'sobre', 'trás',
      'afora', 'fora', 'exceto', 'salvo', 'malgrado', 'durante', 'mediante', 'menos',
      // Articles
      'a', 'as', 'o', 'os', 'um', 'uns', 'uma', 'umas',
      // Pronomes
      'eu', 'tu', 'ele','ela', 'nós', 'vós', 'eles', 'elas',
      'me', 'te', 'lhe', 'nos', 'vos', 'lhes',
      'comigo', 'contigo', 'consigo', 'conosco', 'convosco',
      'meu', 'minha', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas', 'seu', 'sua', 'seus', 'suas',
      'nosso', 'nossa', 'nossos', 'nossas', 'vosso', 'vossa', 'vossos', 'vossas'
    ]
    , auth = {'Authorization': 'OAuth oauth_consumer_key="tnUjZgRN0RUzsbROHcDcNA", oauth_nonce="d06c106bba0d0c0106a7ee84aa5c7845", oauth_signature="vn1ZndgMrNyOlFxDA79dAip1Kog%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1340647653", oauth_token="7905732-VkJk9ZnyEOB6sskxZ11oYSpshOWYO4Qdi6OCNnSsc", oauth_version="1.0"'};

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
      var data = JSON.parse(body);
      if (data[0].protected) {
        res.json({ message: 'User has its tweets protected.', code: '00' })
      }
      res.json({
        user_id: data[0].id_str,
        user_name: data[0].name,
        user_avatar: data[0].profile_image_url,
        user_protected: data[0].protected
      });
    } else if (response.statusCode == '404') {
      var data = JSON.parse(body);
      if (data.errors) {
        data.errors.filter(function(e, i, a){
          if (e.code == 34) {
            res.json(e, 404);
          }
        });
      }
    } else {
      console.log('[' + response.statusCode + ']:' + req.url);
      res.send('Vixe', 500);
    }
  });
}

var termextract = function (messages) {
  var terms = {};
  messages.forEach(function(message){
    var words = new pos.Lexer().lex(message.text.toLowerCase());
    words.forEach(function(word) {
      if (terms[word] === undefined) {
        terms[word] = {word: word, count: 0}
      }
      terms[word]['count'] += 1;
    });
  });

  return _.chain(terms).map(function(term){
    // Merge hashtags and increase its counter by 5;
    if (term.word[0] == '#') {
      var actual  = term.word.slice(1);
      if (terms[actual] === undefined) {
        terms[actual] = { word: actual, count: 0 };
      }
      terms[actual].count = terms[actual].count + term.count * 5;
    }
    return term;
  }).filter(function(term){
    // Remove user mentions, hashtags
    if (term.word[0] === '@' || term.word[0] === '#') {
      return false;
    } else if (term.word.length < 5) {
      return false;
    } else {
      return true;
    }
  }).sortBy(function(term) {
    return term.count;
  }).value();
}

exports.twitterdata = function(req, res) {
  request({
    url: 'http://api.twitter.com/1/statuses/user_timeline.json',
    qs: {
      user_id: req.params.userid,
      count: 200,
      trim_user: true,
      include_rts: true
    }
  }, function(error, response, body) {
    if (response.statusCode == '200') {
      var messages = JSON.parse(body);
      var lastid = messages.pop().id_str;
      request({
        url: 'http://api.twitter.com/1/statuses/user_timeline.json',
        qs: {
          user_id: req.params.userid,
          count: 200,
          trim_user: true,
          include_rts: true,
          max_id: lastid
        }
      }, function (error, response, body){
        if (response.statusCode == '200') {
          messages = messages.concat(JSON.parse(body));
          res.json(termextract(messages));
        } else {
          console.log('[' + response.statusCode + ']:' + req.url + ' Error fetching second load.');
          res.send('Vixe', 500);
        }
      });
    } else {
      console.log('[' + response.statusCode + ']:' + req.url +' Error fetching first load.');
      res.send('Vixe', 500);
    }
  });
}

exports.youtubedata = function(req, res) {
  request({
    url: 'https://gdata.youtube.com/feeds/api/videos',
    qs: {
      alt: 'json',
      q: req.params.kw1 + req.params.kw2,
      v: 2,
      orderby: 'published'
    }
  }, function(error, response, body){
    if (response.statusCode == '200') {
      var data = JSON.parse(body);
      console.log(data);
      res.json(data)
    }
  });
}
