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
      this.on('change:youtubeData', function(){
        var video = this.randomVideo();
        app.layout.setView(".screen", new Channel.Views.Screen({
          video: video
        })).render();
        swfobject.embedSWF('http://www.youtube.com/v/' + video.video_id + '?enablejsapi=1&playerapiid=ytplayer&version=3',
        "zappinchannel", "300", "225", "8", null, null, { allowScriptAccess: "always" }, { id: "video-" + video.video_id });
      }, this);
    },
    fetchData: function() {
      var model = this;
      var twitterData = [];
      $.ajax('/twitter/' + this.get('user_id') + '/data', {
        success: function(data, textStatus, jqXHR) {
          model.set('twitterData', data).set('message', 'Carregando vídeos do canal.').fetchVideos();
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
    fetchVideos: function() {
      var model = this;
      var data = this.get('twitterData');
      $.ajax('/youtube/' + model.randomTerm()  + '/' + model.randomTerm() + '/data', {
        success: function(data, textStatus, jqXHR){
          model.set('youtubeData', data);
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
      var username = this.$('input').val();
      // remove the @, hehe.
      if (username[0] == '@') {
        username = username.slice(1);
      }
      $.ajax('/twitter/' + username, {
        success: function(data, textStatus, jqXHR) {
          app.channel = new Channel.Model(data);
          app.channel.set('message', 'Carregando conteúdo do twitter.');
          app.layout.setView(".meta", new Channel.Views.Meta({
            model: app.channel
          })).render();
          app.channel.fetchData();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (jqXHR.status == '404') {
            alert('Esse usuário não existe!');
          } else {
            console.log(jqXHR);
          }
        }
      });
      event.preventDefault();
    }
  });

  // Return the module for AMD compliance.
  return Channel;

});
