(function($) {
    ////////////
    // Application init //
    ////////////
    //console.log("AnnotatIt init");
    //This var defines an scope of all the vars.
    //console.log("defining models");
    //This var defines an scope of all the vars.
    if(! _.has($, "AnnotatIt")){
        $.AnnotatIt = {};
    }
    
    var AnnotatIt = $.AnnotatIt;
    //Application starter
    //console.log("Starting AnnotatIt application")
    var initListView = function(){
        console.log("Getting annotations");
        AnnotatIt.notes = new  AnnotatIt.NotesContainer();
        AnnotatIt.notes.media_id = AnnotatIt.media_file.get("id");
        AnnotatIt.notes.fetch();
        console.log("Setting up views")
        //list view
        AnnotatIt.notesVM = new AnnotatIt.NotesListVM(AnnotatIt.notes);
        console.log("Setting up bindings")
        ko.applyBindings(AnnotatIt.notesVM, $("#annotateDiv")[0]);
        //AnnotatIt.scriptVM = new AnnotatIt.Media();
        //AnnotatIt.scriptVM.set({"media_id" : AnnotatIt.media_file.get("id") });
        //AnnotatIt.scriptVM.fetch();
        
        //TODO stop overlay loading moving symbol
    };
    
    var initGraphView = function(){
        //console.log("loading graphs");
        var d = AnnotatIt.MediaPlayerFacade.getDuration();
        var w = 520;
        var h = 200;
        //console.log("init comments plot");
        AnnotatIt.CommentsPlot.init(w,h,d);
        //console.log("plots initialized");
        //console.log("adding comments to the graphic plot");
        //TODO this is temporal as I work on the new graph
        //AnnotatIt.CommentsPlot.setSectionsCollection(AnnotatIt.notes); //TODO make a better thing here!!
        AnnotatIt.CommentsPlot.setNotesCollection(AnnotatIt.notes); //TODO make a better thing here!!
        //AnnotatIt.CommentsPlot.updateCommentsFromCollection();
        //AnnotatIt.CommentsPlot.updateSectionsFromCollection();
        AnnotatIt.CommentsPlot.updateNotesFromCollection();
        //AnnotatIt.CommentsPlot.updateAll(AnnotatIt.fsComments.toArray());
        //console.log("comments loaded to the graph");
        //TODO stop overlay loading moving symbol
    };
    
    //console.log("Getting user")
    AnnotatIt.me = new AnnotatIt.Me();
    AnnotatIt.me.fetch()
    //console.log("Getting media")
    //TODO Launch overlay loading moving symbols for video, lists and 
    //get media info:
    AnnotatIt.media_file = new AnnotatIt.Media();
    AnnotatIt.media_file.set({"action" : $.trim($("#media_info_meta").find("#action").html() ) });
    AnnotatIt.media_file.set({"key" : $.trim($("#media_info_meta").find("#key").html() ) });
    AnnotatIt.media_file.fetch({
        success: function(results) {
            //load resources depending on the 
            //console.log("Loading media file");
            //$(document).on("Annotatit:Event:MediaPlayerFacade:Ready", initListView);
            $(document).on("Annotatit:Event:MediaPlayerFacade:Ready", initGraphView);
            //initGraphView();
            AnnotatIt.MediaPlayerFacade.init(AnnotatIt.media_file.get("media_network"), AnnotatIt.media_file.get("media_id"), "MediaPlayerDiv");
            initListView();
        },
        error : function(){
            //TODO make a good meaningful error message for the user
            console.log("Error loading media resource. Maybe you don't have permission to see this file or it was erased");
            
        }
    });
    

})(jQuery);
