console.log("comments_display_box loading ...")


var CommentsDisplayBox = (function ($ ) {
    commentsDiv = "CommentsDisplayDiv";
    templateDiv = null;
    ajaxAddress = null;
    
    
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
            //get the div where comments will be placed
            //get the template
            //compile the template
            //Build comments tree
            // now plot the tree in inorder or preorder
            
        },
        //filters the comments that are shown
        filter : function(args){
            //TODO
        },
        //sorts comments according to input
        // param is the parameter to sort by
        // order is increasing | decreasing
        sortComments : function(param, order){
            //TODO
        }
    };
}($));


console.log("comments_display_box loaded !!")
