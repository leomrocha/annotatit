(function($) {
    ////////////
    // Application init //
    ////////////
    console.log("AnnotatIt init");
    //This var defines an scope of all the vars.
    if(! _.has($, "AnnotatIt")){
        $.AnnotatIt = {};
    }
    
    var AnnotatIt = $.AnnotatIt;
    //Application starter
    console.log("Starting AnnotatIt application")

    console.log("Getting user")
    AnnotatIt.me = new AnnotatIt.Me();
    AnnotatIt.me.fetch()
    console.log("Getting media")
    //get media info:
    //AnnotatIt.media_file = new AnnotatIt.Media();
    AnnotatIt.mediaContainer = new AnnotatIt.MediaContainer()
    //AnnotatIt.mediaVM = new AnnotatIt.AddMediaVM(AnnotatIt.media_file);
    AnnotatIt.mediaVM = new AnnotatIt.AddMediaVM(AnnotatIt.mediaContainer);
    ko.applyBindings(AnnotatIt.mediaVM, $("#AnnotatItAddMedia")[0]);


})(jQuery);
