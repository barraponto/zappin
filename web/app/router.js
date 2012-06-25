define([
  // Application.
  "app",

  // Modules
  "modules/channel"
],

function(app, Channel) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index"
    },

    index: function() {
      app.useLayout('screen');
      app.layout.setView(".controls", new Channel.Views.Dial());
      app.layout.render();
    }
  });

  return Router;

});
