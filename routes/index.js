
/*
 * GET home page.
 */

  var fs = require('fs')
    , request = require('request')
    , pos = require('pos')
    , _ = require('underscore');

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
            res.send('Eita: nenhum usuário encontrado.', 404);
          }
        });
      }
    } else {
      console.log('[' + response.statusCode + ']: ' + req.url);
      res.send('Vixe: API do Twitter baleio/miguelou na busca por usuários.', 500);
    }
  });
};

var termextract = function (messages) {
  var terms = {};
  messages.forEach(function(message){
    var words = new pos.Lexer().lex(message.text.toLowerCase());
    words.forEach(function(word) {
      if (terms[word] === undefined) {
        terms[word] = { word: word, count: 0 };
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
    if (term.word[0] === '@' || term.word[0] === '#' || term.word.slice(0,4) == 'http') {
      return false;
    } else if (term.word.length < 5) {
      return false;
    } else {
      return true;
    }
  }).sortBy(function(term) {
    return -term.count;
  }).value().slice(0, 256);
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
          res.send('Vixe: API do Twitter baleiou/miguelou na recarga de tweets.', 500);
        }
      });
    } else {
      res.send('Vixe: API do Twitter baleiou/miguelou na carga de tweets.', 500);
    }
  });
};

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
      if (data.feed.entry) {
        res.json(data.feed.entry.map(function(entry){
          var media = entry['media$group'];
          return {
            video_id: media['yt$videoid']['$t'],
            video_title: media['media$title']['$t'],
            video_length: media['yt$duration']['seconds'],
            video_des: media['media$description']['$t']
          };
        }));
      } else {
        console.log(error);
        res.send('Vixe: problemas com acentuação. (eu acho)', 500);
      }
    }
  });
};
