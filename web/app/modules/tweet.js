define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Tweet = app.module();

  // Default model.
  Tweet.Model = Backbone.Model.extend({

  });

  // Default collection.
  Tweet.Collection = Backbone.Model.extend({
    model: Tweet.Model
  });

  // Return the module for AMD compliance.
  return Tweet;

});
