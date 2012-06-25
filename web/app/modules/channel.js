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

  });

  // Default collection.
  Channel.Collection = Backbone.Model.extend({
    model: Channel.Model
  });

  Channel.Views.Dial = Backbone.View.extend({
    tagName: 'form',
    template: 'dial',
    events: {
      'submit': 'create'
    },
    create: function(event) {
      console.log(this.$('input').val());
      event.preventDefault();
    }
  });

  // Return the module for AMD compliance.
  return Channel;

});
