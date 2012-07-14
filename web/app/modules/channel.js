define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Channel = app.module();

  // Default model.
  Channel.Model = Backbone.Model.extend({
    initialize: function() {
      var model = this;
      app.layout.setView(".meta", new Channel.Views.Meta({
        model: model
      })).render();
      console.log(this);
      this.fetchData();
      // this.on('change:youtubeData', function(){
      //   var video = this.randomVideo();
      // }, this);
    },
    setScreen: function() {
      app.layout.setView(".screen", new Channel.Views.Screen({
      })).render();
      var screenID = swfobject.embedSWF('http://www.youtube.com/apiplayer?enablejsapi=1&version=3',
      "zappinchannel", "300", "225", "8", null, null, { allowScriptAccess: "always" }, { id: "channel-screen" });
      this.set('screenID', screenID);
    },
    fetchData: function() {
      var model = this;
      var twitterData = [];
      $.ajax('/twitter/' + this.get('user_id') + '/data', {
        success: function(data, textStatus, jqXHR){
          model.set('twitterData', data).set('message', 'Carregando vídeos do canal.').fetchVideos();
          model.setScreen();
        },
        error: function(jqXHR, textStatus, errorThrown){
          model.set('message', 'Usuário não tem nenhuma mensagem. Que droga.');
        }
      });
    },
    randomVideo: function() {
      var data = this.get('youtubeData');
      return data[Math.floor(Math.random() * data.length)];
    },
    randomTerm: function() {
      var data = this.get('twitterData');
      return data[Math.floor(Math.random() * data.length)].word;
    },
    fetchVideos: function(m) {
      var model = ('undefined' === typeof m) ? this : m;
      var data = model.get('twitterData');
      $.ajax('/youtube/' + model.randomTerm()  + '/' + model.randomTerm() + '/data', {
        success: function(data, textStatus, jqXHR){
          model.set('youtubeData', data);
          // model.set('intervalID', window.setInterval(model.fetchVideos(model), 15000));
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (jqXHR.status == '500') {
            model.fetchVideos();
          } else {
            console.log(jqXHR);
          }
        }
      });
    }
  });

  // Default collection.
  Channel.Collection = Backbone.Collection.extend({
    model: Channel.Model
  });

  Channel.Views.Screen = Backbone.View.extend({
    template: 'yt_embed',
    serialize: function() {
      return this.options.video;
    }
  });

  Channel.Views.Meta = Backbone.View.extend({
    initialize: function(){
      this.model.on('change', this.render, this);
    },
    template: 'channel_meta',
    serialize: function() {
      return this.model.toJSON();
    }
  });

  Channel.Views.Dial = Backbone.View.extend({
    tagName: 'form',
    template: 'dial',
    id: 'dial',
    events: {
      'submit': 'create'
    },
    create: function(event) {
      event.preventDefault();
      var username = this.$('input').val();
      // remove the @, hehe.
      if (username[0] == '@') {
        username = username.slice(1);
      }
      $.ajax('/twitter/' + username, {
        success: function(data, textStatus, jqXHR) {
          data.message = 'Carregando conteúdo do twitter.';
          app.channel = new Channel.Model(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (jqXHR.status == '404') {
            alert('Esse usuário não existe!');
          } else {
            console.log(jqXHR);
          }
        }
      });
    }
  });

  // Return the module for AMD compliance.
  return Channel;

});
