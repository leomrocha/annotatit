Router = Backbone.Router.extend({
    routes: {
    /*
    "media/:action/:id": "loadMedia",
    "media/:action/comment/:id": "loadComment",
    "media/:action/comments/": "loadComments",
    "media/:action/section/:id": "loadSection",
    "media/:action/sections/": "loadSections",
    "media/:action/user/:id": "loadUser",
    */
    },
    initialize: function() {
    },
    start: function() {
        Backbone.history.start({
        pushState: true
    });

    }/*,
    loadAll: function(id) {
    // TODO Get the media, comments, sections of the annotatit that correspond to that id.
    },
    loadMedia: function(media_id){

    },
    loadSection: function(section_id){

    },
    loadSections: function(media_id){

    },
    loadComment: function(comment_id){

    },
    loadComments: function(media_id){

    }
    */
});
