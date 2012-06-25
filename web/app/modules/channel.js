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
    fetchData: function() {
      var model = this;
      var twitterData = [];
      $.ajax('/twitter/' + this.get('user_id') + '/data', {
        success: function(data, textStatus, jqXHR) {
          model.set('twitterData', data).set('message', 'Carregando vídeos do canal.');
        }
      });
    }
  });

  // Default collection.
  Channel.Collection = Backbone.Collection.extend({
    model: Channel.Model
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
