console.log("comments_display_box loading ...")


var GraphDisplayBox = (function ($ ) {
    graphDiv = "GraphDiv";
    duration = 0;
    width = 0;
    height = 0;
    templateDiv = null;
    ajaxAddress = null;
    sections = [];
    flaggedComments = [];
    canvas = null;
    colors = {
        background : {
            background-color : "#222"
        },
        ruler : {
            background-color : "#22F"
        },
        current_time_cursor : {
            color : "#f22"
        },
        mouse_cursor : {
            color : "#2f2"
        },
        sections : {
            background-color : "#555"
        }, 
        plots : {
            background-color : "#555"
        }
    };
    _init = function(){
        //create every component:
        //  Background
        canvas = TODO;
        //  Ruler
        //  current time cursor
        //  mouse follower cursor
        //  flags display
        //  section display
        //  plots display
        //  Zoom display
    };
    
    return {
        set :function(name, value){
            if(_.has(this,name) ){
                return this[name]; //TODO check
            }
            //TODO throw exception
        },
        get :function(name){
            if(_.has(this,name) ){
                return this[name]; //TODO check         
            }
            return null;
        },
        //inits the comments
        init : function(){ //TODO
            //get all the values from the server
            //get the div where Graph will be placed
            //set the width and height of the div
            //set the width and height of the canvas
            //check for dependencies. Is ocanvas loaded??
            //  if not, load it
            if(typeof TODO == "undefined") {
                $.getScript("", function() {
                 _init();
                });
            }else{
                _init();
            }
        },
        //filters the elements displayed
        filter : function(args){
            //TODO
        }
    };
}($));


console.log("comments_display_box loaded !!")
