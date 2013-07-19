window.Router = Backbone.Router.extend({
  routes: {
    "annotate_media/:id": "loadAnnotateMedia"
  },
  initialize: function() {
  },
  start: function() {
    Backbone.history.start({
      pushState: true
    });
  },
  loadAnnotateMedia: function(id) {
    // Get the video, comments, sections of the annotatit that correspond to that id.
  }
});