//console.log("graph_display_box loading ...")


/*
Short documentation
this module first check for dependencies, 
if not loaded it tries to load the dependencies from CDN networks

This module uses mainly EaselJS for all the canvas manipulation

For inheritance the Prototype inheritance is used

This module defines:
GraphContainer: Generic container for the different parts of the canvas
Ruler: a ruler containing the timeline and marks
FlagsDisplay: The display where all
              FlaggedSynchronizedComments are placed in a time based way. 
              This shows only little flags
Flag: The graphic representation of a FlaggedSynchronizedComment on the canvas
SectionsDisplay: The display where all the sections are shown to the user
Section: The graphic representation of a Section. 
         A Section is a time segment of a media file 
         associated with a color, user, and name
Cursor: A generic vertical (spans all the height of the canvas) cursor
CurrentTimeCursor: a cursor that is destinated to follow the time 
                   of the media being played (red)
MouseFollowerCursor: A cursor that follows the mouse on hover over
                     the canvas (green)


GraphDisplayBox: The main display containing, initializing and managing all the previous elements

This module triggers the following events:
    

    //On mouse clicked over Ruler
    $.event.trigger("Annotatit:Event:time:set", time);
    
    //On updating a [Flag|Section]
    $.event.trigger("Annotatit:Event:[Flag|Section]:updated", this.data);
    //on mouse events over a [Flag|Section]
    $.event.trigger("Annotatit:Event:[Flag|Section]:mouse:over", this.data);
    $.event.trigger("Annotatit:Event:[Flag|Section]:mouse:out", this.data);
    $.event.trigger("Annotatit:Event:[Flag|Section]:mouse:press", this.data);
    $.event.trigger("Annotatit:Event:[Flag|Section]:mouse:release", this.data);
    
    //on mouse clicked over a [Flag|Section]
    $.event.trigger("Annotatit:Event:time:set", this.data.media_time);
    $.event.trigger("Annotatit:Event:[Flag|Section]:mouse:click", this.data);
s
    Note:
    time indicates the time in seconds
    this.data indicates the data object (as obtained from $.parseJSON format)
    containing the information of the [Flag|Section] 

*/

//check for dependencies and load if problem
// jquery
if(typeof createjs == "undefined") {
    console.log("loading jQuery from CDN ...");
    $.getScript("http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js", function() {
    });
}
// underscore
if(typeof _ == "undefined") {
    console.log("loading Underscore from CDN ...");
    $.getScript("http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min.js", function() {
    });
}
//easelJS
if(typeof createjs == "undefined") {
    console.log("loading EaselJS from CDN ...");
    $.getScript("http://code.createjs.com/easeljs-0.6.1.min.js", function() {
    });
}
//setup hover tags (html tag is easier than on canvas)
var graphDiv = "AnnotatItGraphDiv";
var graphCanvas = "AnnotatItGraphCanvas"; //TODO avoid repetition of this var (that is inside an object already)


var _number2Time = function(time){
    var ht = Math.floor(time/3600);
    var hh =  ht >0? ht+":" : "";
    ht = Math.floor((time - ht )/60);
    var mm = ht >0? ht+":" :  "";
    var ss = (time%60)>0 ? (time % 60).toFixed(2) : "00";
    var timetxt = hh+mm+ss;
    return timetxt;
};

/*
//tooltip for sections
Deprecated tooltip implementation!!!
var __annotatit_graph_flaggedComment_template = '<div id="CommentCanvasTooltip" class="owner_id-<%-owner_id %>"><table class="table table-hover "><tr><th width="80"> <div><a href="javascript:MediaPlayerFacade.seekTime(<%-media_time%>)"><%var ht = Math.floor(media_time/3600);var hh =ht >0? ht+":" : "";ht = Math.floor((media_time - ht )/60);var mm = ht >0? ht+":" :"";var ss = (media_time%60)>0 ? (media_time % 60).toFixed(2) : "00";var timetxt = hh+mm+ss;%><%-timetxt%></a> <span class="badge" style="background-color: <%-flag_color%>;"><%-keyboard_shortcut%> </span></div><img src="<%-owner_thumbnail_url %>" /><div> <span class=""> <%-owner_name %> </span></div></th><td class="comment_text" rowspan="2"><div class="pull-left"><p><%-text %></p></div><!--Send to left--></td></tr></table> </div>';
var __agFCtcomp = _.template(__annotatit_graph_flaggedComment_template);
var graphCommentTooltipActivate = function(e,data){
    //create the element
    var e = __agFCtcomp(data);
    //set dimensions
    //set background
    var container = $("#"+graphDiv);
    var pos = container.position();
    console.log("container position = "+pos);
    console.log("container position = "+_.keys(pos));
    console.log("container position = "+_.values(pos));
    //add to body
    container.append(e);
    //e.hide();
    var cvs = $("#"+graphCanvas);
    //console.log(cvs.width());
    var tt = $("#CommentCanvasTooltip");
    tt.css("width", cvs.width());
    tt.height(cvs.height * 0.55);
    tt.css({position:"fixed", left:pos.left, top:pos.top + cvs.height * 0.45});
    //hide it
    //set position over canvas
    //show element
    $(document).off("Annotatit:Event:Flag:mouse:over");
    $(document).on("Annotatit:Event:Flag:mouse:out", graphCommentTooltipRemove);
}
var graphCommentTooltipRemove = function(e,data){
    //look for the tooltip and erase it
    $("#CommentCanvasTooltip").remove();
    $(document).on("Annotatit:Event:Flag:mouse:over", graphCommentTooltipActivate);
    $(document).off("Annotatit:Event:Flag:mouse:out");
}

//setup event handlers
$(document).on("Annotatit:Event:Flag:mouse:over", graphCommentTooltipActivate);
//$(document).on("Annotatit:Event:Flag:mouse:out", graphCommentTooltipRemove);
/////////////////////////////////////////////
//tooltip for comments
Deprecated implementation!!
*/
//console.log("Defining data types ...")
/////////////////////////////////////////////
//Generic container for my needs
/////////////////////////////////////////////
var GraphContainer = function(width, height, duration) {
  this.initialize(width, height, duration);
};
GraphContainer.prototype = new createjs.Container();
GraphContainer.prototype.Container_initialize = GraphContainer.prototype.initialize;
GraphContainer.prototype.Container_tick = GraphContainer.prototype._tick;
GraphContainer.prototype.initialize = function(width, height, duration) {
    //console.log("Initializes parent!");
    this.Container_initialize();
    this.elements = new  Array();
    this.elementsDict = new Object();
    this.visible = "all"; //visible elements: [ all, policy]
    this.policy = new Object();
    this.rows = new Array(); //
    //WARNING!!!! the following must be set during children class initialization 
    // cause this is what gives the hability of being polimorphic!!
    this.ElementConstructor = null;
    this.heightSpacing = 10;
    this.maxRows = height/this.heightSpacing;
    this.yOffset = 0;
    this.sortParam = null;
    //END warning
    // add custom setup logic here.
    //set width, set height, 
    this.w = width;
    this.h = height;
    this.duration = duration;
    this.pps = this.w/this.duration; //pixels per second
    this.spp = this.duration/this.w; //seconds per pixel
    //console.log("w = "+this.w);
    //console.log("h = "+this.h);

    //check duration:    
    //Create background:
};
GraphContainer.prototype._tick = function () {
    this.Container_tick();
    //console.log("GraphContainer Ticked");
};


//adds an object or list of objects to the display
GraphContainer.prototype.add = function(obj){
    //save previous length
    var plength = this.elements.length;
    //for all the new elements try to place them where they interrupt the less
    //now reset y coordinates of all the sections in display for easy viewing

    var data = new Array();
    //console.log("Adding an element to the GraphContainer object");
    //if obj is string, parse json and create the object, and assume a single object is being created
     //TODO deal with JSON string input that contain many fields
    if(_.isArray(obj)){
        //console.log("input is array");
        //else assume it is an array of objects or json strings
        _.each(obj, function(e,i,l){ this.push(e); }, data);
    }else if (_.isString(obj)){
        //console.log("input is string");
        data.push( $.parseJSON(obj) );
    }else if(_.isObject(obj)){
        //console.log("input is object");
        data.push(obj);
    }else {
        console.log("ERROR creating new Graph, input data is not array, string nor object type. Input object = "+obj);
        return false; //TODO throw error
    }
    //console.log("data now is: "+data);
    for(var i=0; i< data.length; i++){
        //console.log("data["+i+"] ="+data[i]);
        //WARNING HARDCODED VALUE
        var f = new this.ElementConstructor(this.w,this.h,duration, data[i]); //TODO make the dimensions more ... dynamic/ automatic
        //console.log(f);
        //set coordinates
        //f.x = data[i].media_time * this.pps;
        //f.y = 60; //TODO this is test, REMOVE
        //console.log("x = "+f.x);
        //f.y = //TODO
        this.elements.push(f);
        this.elementsDict[f.id] = f;
        //add to stage
        //console.log("elements = "+this.elements);
        //console.log("elementsDict = "+this.elementsDict);
        this.addChild(f);
        //console.log("check children");
        //console.log(this.children); 
    };
    //console.log("sort by = "+ this.sortParam);
    //TODO FIX sorting is not working.
    // for some reason when writing down "media_time" it finds the element
    // but when writing the dynamic this.sortParam it DOES NOT find it
    // if _.keys(e.data) "media_time" (or the corresponding key according to data type) 
    // is in the list, BUT if: _.has(e.data, this.sortParam) it DOES NOT find the key WEIRD
    this.elements = _.sortBy(this.elements, function(e){ 
                                    //console.log("e = "+ _.has(e.data, this.sortParam));
                                     return e.data[this.sortParam]; 
                                     });
    
    //console.log("elements = "+ this.elements);
    for(var i=0; i< this.elements.length; i++){
        //console.log("max rows = "+this.maxRows);
        //console.log("i = "+i);
        //console.log("this.heightSpacing ="+this.heightSpacing);
        this.elements[i].y = ( i%(this.maxRows-1) ) * this.heightSpacing +this.yOffset;
    }
};
//updates values of an object on the display
GraphContainer.prototype.update = function(obj){
    var data;
    if (_.isString(obj)){
        data = $.parseJSON(obj) ;
    }else if(_.isObject(obj)){
        data = obj;
    }else {
        console.log("ERROR creating new Graph, input data is not string nor object type. Input object = "+obj);
        return false; //TODO throw error
    }
    //find the element
    if(_.has(this.elementsDict, data.id)){
        //update the element
        this.elementsDict[data.id].update(data);
        //update the position
        this.elementsDict[data.id].x = data.media_time * this.pps;
        //this.elementsDict[data.id].y = 60;
        //this.elementsDict[data.id].y = ; //TODO
    }else{
        console.log("ERROR. Impossible to modify inexisting Graph.  Given object = "+obj);
        return false; //TODO throw error
    }
    
};
//removes an object from the display
GraphContainer.prototype.remove = function(obj){
    var data;
    if (_.isString(obj)){
        data = $.parseJSON(obj) ;
    }else if(_.isObject(obj)){
        data = obj;
    }else {
        console.log("ERROR removing Graph, input data is not string nor object type. Input object = "+obj);
        return false; //TODO throw error
    }
    //find the element
    if(_.has(this.elementsDict, data.id)){
        //update the element
        this.removeChild(this.elementsDict[data.id]);
        delete this.elementsDict[data.id];
    }else{
        console.log("ERROR. Impossible to remove inexisting Graph.  Given object = "+obj);
        return false; //TODO throw error
    }
};

/////////////////////////////////////////////
//Ruler with timeline for info
/////////////////////////////////////////////
var Ruler = function(width, height, duration) {
  this.init(width, height, duration);
};
Ruler.prototype = new GraphContainer();
Ruler.prototype._onMouseOver = function(e){
    //console.log("mouse over = "+e);
    //console.log("this = "+this);
    //set event listeners
    this.onMouseOver = function(e){}; //this._onMouseOver;
    //this.background.addEventListener("mouseover", this._onMouseOver);
    //this.addEventListener("mouseover", this._onMouseOver);
    this.onMouseOut = this._onMouseOut;
    //this.onPress = this._onMousePress;
    //this.addEventListener("mouseup", this._onMouseRelease);
    //this.onMouseUp = this._onMouseRelease;
    this.onClick = this._onMouseClick;
    //remove this event listener
    //modify color
    this.background.graphics.clear().beginLinearGradientFill(this._activeGradient, [0,1], 0,this.h/3,0, this.h).drawRect(0,0,this.w,this.h).endFill();
    //update 
};

Ruler.prototype._onMouseOut = function(e){
    //console.log("mouse out = "+e);
    //console.log("this = "+this);
    //console.log("target = "+target);
    this.background.graphics.clear().beginLinearGradientFill(this._bkgGradient, [0,1], 0,this.h/3,0, this.h).drawRect(0,0,this.w,this.h).endFill();
    //events
    this.onMouseOver = this._onMouseOver;
    //this.background.addEventListener("mouseover", this._onMouseOver);
    //this.addEventListener("mouseover", this._onMouseOver);
    this.removeEventListener("mouseout");
    //this.removeEventListener("mousedown");
    this.removeEventListener("click");
    //this.onMouseOut = function(e){}; //this._onMouseOut;
    //this.onPress = function(e){}; //this._onMousePress;
    //this.onMouseUp = function(e){}; //this._onMousePress;
    //this.removeEventListener("mouseup");
    //this.onClick = function(e){}; //this._onMouseClick;
};
Ruler.prototype._onMousePress = function(e){
    //console.log("mouse press = "+e);
    var evtObj = new Object();
    evtObj.target = this;
    evtObj.xPos = e.stageX;
    evtObj.time = e.stageX / this.pps;
    //console.log("evtObj = "+evtObj);
    
    //$(document).trigger("Annotatit:Event:Ruler:time", this);
};
Ruler.prototype._onMouseRelease = function(e){
    //console.log("mouse release = "+e);
};
Ruler.prototype._onMouseClick = function(e){
    //console.log("mouse click = "+e);
    var time = e.stageX / this.pps;
    //console.log("evtObj = "+evtObj);
    //console.log(evtObj.time);
    //console.log(evtObj.xPos);
    $.event.trigger("Annotatit:Event:time:set", time);
};
Ruler.prototype.init = function(width, height, duration){
    this.initialize(width, height, duration);
    //create rect background, with a colour
    //console.log("init ruler");
    //console.log("w = "+this.w);
    //console.log("h = "+this.h);
    //background
    this._color = "#1111FF";
    this._bkgGradient = ["#555399","#323232"];
    this._activeGradient = ["#5522cc","#424242"];
    this._bkgGradientImp = [0,1]
    this.cursor = "pointer";
    var bkg = new createjs.Graphics().beginLinearGradientFill(this._bkgGradient, [0,1], 0,this.h/3,0, this.h).drawRect(0,0,this.w,this.h).endFill();
    this.background = new createjs.Shape(bkg);
    this.addChild(this.background);
    //now the current time display

    
    //now the ruler marks
    this.rulerLines = new Array();
    //seconds in which I rather have the ruler marks, TODO transform to minutes and hours when needed for better visualization
    var steps = _.sortBy( _.map([1, 5, 10, 20, 30, 60, 120, 300, 600, 1200, 3600], function(t){ return [t, Math.abs( (this.duration/10) -t) ]} ), function(p){return p[1];} ); 
    //console.log("steps = "+steps);
    this.timeStep = steps[0][0];//time step for the ruler
    this.pps = this.w/this.duration; //pixels per second
    this.pixelStep = this.pps * this.timeStep;
    var xpos = 0;
    while(xpos< this.w){
        //console.log("creating line: xpos = "+xpos);
        var l = new createjs.Graphics().setStrokeStyle(1).beginStroke("white").moveTo(xpos, this.h/1.5).lineTo(xpos,this.h);
        var line = new createjs.Shape(l);
        this.addChild(line);
        //TODO BUG MINOR correct times shows sometimes like 3:59 instead of a round number like 4:00
        var t = Math.floor(xpos/this.pps);
        //console.log("t  = "+t);
        var ht = Math.floor(t/3600);
        //console.log("ht  = "+ht);
        var hh =  ht >0? ht+":" : "";
        //console.log("hh  = "+hh);
        ht = Math.floor((t - ht )/60);
        //console.log("ht  = "+ht);
        var mm = ht >0? ht+":" :  "";
        //console.log("mm  = "+mm);
        var ss = (t%60)>0 ? t % 60 : "00";
        var timetxt = hh+mm+ss;
        //console.log("ruler time = "+timetxt);
        var text = new createjs.Text( timetxt, "10px Arial", "#ffffff");
        text.textAlign ="center";
        text.y = this.h/4;
        text.x = xpos;
        //check the text is inside the canvas
        if(text.x < 5 ){
            text.x = 5;
        }else if(text.x > this.width - 5 ){
            text.x = this.width - 5;
        }
        //add to stage
        this.addChild(text);
        this.rulerLines.push([line, text]);
        xpos+=this.pixelStep;
    };
    /////////////////
    //Events
    /////////////////
    //on hover -> focus (change some color) and  add event listeners
    //this.background.enableMouseOver();
    this.onMouseOver = this._onMouseOver;
    //this.background.addEventListener("mouseover", this._onMouseOver);
    //this.addEventListener("mouseover", this._onMouseOver);
    //this.onMouseOut = this._onMouseOut;
    //this.onPress = this._onMousePress;
    //this.onClick = this._onMouseClick;
    //on mouse out -> unfocus (change to previous color) and eliminate event listeners
    //On click -> send event to set player to the corresponding time
    //On press -> send event to show/update the thumbnail
    
};
/////////////////////////////////////////////
//Flags indicating different points
/////////////////////////////////////////////

var FlagsDisplay = function(width, height, duration) {
  this.init(width, height, duration);
};
FlagsDisplay.prototype = new GraphContainer();
FlagsDisplay.prototype.init = function(width, height, duration){
    this.initialize(width, height, duration);
    this.flags = new  Array();
    this.flagsDict = new Object();
    this.visible = "all"; //visible elements: [ all, policy]
    this.policy = new Object();
    this.ElementConstructor = Flag;
    this.sortParam = "media_time";
    this.heightSpacing = 5;
    this.maxRows = this.h/this.heightSpacing;
    this.yOffset = 5;
    //create rect background, with a colour
    //console.log("init FlagsDisplay");
    //console.log("w = "+this.w);
    //console.log("h = "+this.h);
    //console.log("rows = "+this.maxRows);
    //background
    this._bkgColor = "#eeeeee";
    var bkg = new createjs.Graphics().beginFill(this._bkgColor).drawRect(0,0,this.w,this.h);
    this.background = new createjs.Shape(bkg);
    this.addChild(this.background);
};
//filters showing only the flags with the input policy 
// the status is saved in this.visible
// policy can be a JSON string or a JSON object containing:
// { visible: { CRITERIA: VALUE }, invisible:{ CRITERIA: VALUE } }
// or it can be an array of 3 data containing: [visible | invisible], CRITERIA (field), VALUE
FlagsDisplay.prototype.filter = function(policy){
    //TODO
};

/////////////////////////////////////////////
//Flags 
// Each flag correspond to a
// FlaggedComment in the model
/////////////////////////////////////////////

//Flag constructor
//data is an Object containing:
//{
//    "type":"FlaggedSyncComment" ,
//    can_edit:[true|false];
//    can_delete:[true|false];
//    id:"",
//    owner_id: "",
//    owner_name: "",
//    owner_thumbnail_url: "",
//    media_id:"",
//    parent_id:"",
//    media_time:"",
//    flag_name:"",
//    keyboard_shortcut:"",
//    flag_color:"",
//    text:"",
//    creation_datetime:"",
//    update_datetime:""
//}
// JSON is not allowed as it should already come as an object.
// This is for memory economy as I don't want to have many objects 
// around with the same data
var Flag = function(canvas_width, canvas_height, duration, data) {
  this.initialize(canvas_width, canvas_height, duration, 10, 10, data);
};
Flag.prototype = new createjs.Container();
Flag.prototype.Container_initialize = Flag.prototype.initialize;
Flag.prototype.Container_tick = Flag.prototype._tick;
//Flag.prototype = new GraphContainer(); 
Flag.prototype.checkData = function(data){
    //TODO test input data is correct
    //else throw an exeption
};
Flag.prototype.initialize = function(canvas_width, canvas_height, duration, width, height, data) {
    this.Container_initialize();
    
    this.checkData(data);
    
    this.data = data;   
    this.w = width;
    this.h = height;
    this.duration = duration;
    this.pps = canvas_width/duration;
    this.spp = duration/canvas_width;
    this.x = data.media_time * this.pps;
    //Find y position ... DYNAMIC TODO
    this.y = 10;
    this._bkgGradient = [data.flag_color,"#121212"];
    this._activeGradient = [data.flag_color,"#424242"];
    this.cursor = "pointer";
    //Create background:
    var bkg = new createjs.Graphics().beginRadialGradientFill(this._bkgGradient, [0,1], 0,0, this.w/3 , 0,0, this.w/2).drawCircle(0,0,this.w/2).endFill();
    this.background = new createjs.Shape(bkg);
    this.addChild(this.background);
    //write flag text
    //console.log("data = "+this.data);
    //console.log("data = "+this.data.keyboard_shortcut);
    //console.log("data color = "+this.data.flag_color);
    this.text = new createjs.Text(this.data.keyboard_shortcut, "10px Arial", "#ffffff"); //WARNING HARDCODED VALUE
    this.text.textAlign ="center";
    this.text.y = -5; //WARNING HARDCODED VALUE
    //this.text.x = xpos;
    this.addChild(this.text);
    //event handling
    this.onMouseOver = this._onMouseOver;
};
//checks the fields of the current value and 
//the new ones.
//will only accept an update if id corresponds
Flag.prototype.update = function(new_data){
    //check input format, if json convert to object
    //TODO check id
    // if id matches
    // change the fields
    //launch event
    $.event.trigger("Annotatit:Event:Flag:updated", this.data);
    
};
//Flag.prototype.remove = function(){
//};

Flag.prototype._tick = function () {
    this.Container_tick();
    //console.log("Flag Ticked");
};
Flag.prototype._onMouseOver = function(e){
    //console.log("mouse over = "+e);
    //console.log("this object = "+this);
    //console.log("this keys = "+_.keys(this));
    //console.log("this values = "+_.values(this));
    //set event listeners
    //this.onMouseOver = function(e){}; //this._onMouseOver; //do it in another way
    this.removeEventListener("mouseover");
    this.onMouseOut = this._onMouseOut;
    this.onClick = this._onMouseClick;
    //hack to bring to front
    var parent = this.parent;
    this.parent.removeChild(this);
    parent.addChild(this);
    
    //bring to front TODO
    //TODO 
    //modify color
    this.background.graphics.clear().beginRadialGradientFill(this._bkgGradient, [0,1], 0,0,this.w/2 , 0,0, this.w).drawCircle(0,0,this.w).endFill();
    //update 
    $.event.trigger("Annotatit:Event:Flag:mouse:over", this.data);
};

Flag.prototype._onMouseOut = function(e){
    //console.log("mouse out = "+e);
    //console.log("this = "+this);
    this.background.graphics.clear().beginRadialGradientFill(this._bkgGradient, [0,1], 0,0,this.w/3 , 0,0, this.w/2).drawCircle(0,0,this.w/2).endFill();
    //events
    this.onMouseOver = this._onMouseOver;
    this.removeEventListener("mouseout");
    this.removeEventListener("click");
    $.event.trigger("Annotatit:Event:Flag:mouse:out", this.data);
};
Flag.prototype._onMousePress = function(e){
    //console.log("mouse press = "+e);
    $.event.trigger("Annotatit:Event:Flag:mouse:press", this.data);
};
Flag.prototype._onMouseRelease = function(e){
    //console.log("mouse release = "+e);
    $.event.trigger("Annotatit:Event:Flag:mouse:release", this.data);
};
Flag.prototype._onMouseClick = function(e){
    //console.log("mouse click = "+e);
    //console.log("evtObj = "+evtObj);
    //console.log(evtObj.mouseEvent);
    $.event.trigger("Annotatit:Event:time:set", this.data.media_time);
    $.event.trigger("Annotatit:Event:Flag:mouse:click", this.data);
};




/////////////////////////////////////////////
//Sections display
/////////////////////////////////////////////


var SectionsDisplay = function(width, height, duration) {
  this.init(width, height, duration);
};
SectionsDisplay.prototype = new GraphContainer();
//SectionsDisplay.prototype.container_add = GraphContainer.prototype.add;
SectionsDisplay.prototype.init = function(width, height, duration){
    this.initialize(width, height, duration);
    this.ElementConstructor = Section;
    this.sortParam = "begin_time";
    this.heightSpacing = 10;
    this.maxRows = height/this.heightSpacing;
    
    //create rect background, with a colour
    //console.log("init SectionsDisplay");
    //console.log("w = "+this.w);
    //console.log("h = "+this.h);
    //console.log(" this.heigthSpacing = "+this.heigthSpacing);
    //console.log("this.maxRows = "+this.maxRows);
    //background
    this._bkgColor = "#dedede";
    var bkg = new createjs.Graphics().beginFill(this._bkgColor).drawRect(0,0,this.w,this.h);
    this.background = new createjs.Shape(bkg);
    this.addChild(this.background);
};

/////////////////////////////////////////////
//Section 
// Each section correspond to a
// Section in the model
/////////////////////////////////////////////

//Section constructor
//data is an Object containing:
//{
//    "type":"Section" ,
//    id:"",
//    can_edit:[true|false];
//    can_delete:[true|false];
//    owner_id: "",
//    owner_name: "",
//    owner_thumbnail_url: "",
//    media_id:"",
//    parent_id:"",
//    name:"",
//    color:"",
//    begin_time:"",
//    end_time:"",
//    creation_datetime:"",
//    update_datetime:""
//}
// JSON is not allowed as it should already come as an object.
// This is for memory economy as I don't want to have many objects 
// around with the same data
var Section = function(canvas_width, canvas_height, duration, data) {
  this.initialize(canvas_width, 20, duration, data);
};
Section.prototype = new createjs.Container();
Section.prototype.Container_initialize = Section.prototype.initialize;
Section.prototype.Container_tick = Section.prototype._tick;
//Section.prototype = new GraphContainer(); 
Section.prototype.checkData = function(data){
    //TODO test input data is correct
    //else throw an exeption
};
Section.prototype.initialize = function(canvas_width, height, duration, data) {
    this.Container_initialize();
    
    this.checkData(data);
    
    this.data = data;   
    this.duration = duration;
    this.pps = canvas_width/duration;
    this.spp = duration/canvas_width;
    this.w = (this.data.end_time - data.begin_time ) * this.pps;
    this.h = height;
    this.x = data.begin_time * this.pps;
    //Find y position ... DYNAMIC TODO
    this.y = 10;
    this._bkgGradient = [data.color,"#424242"];
    this._activeGradient = [data.color,"#121212"];
    this.cursor = "pointer";
    //Create background:
    var bkg = new createjs.Graphics().beginLinearGradientFill(this._bkgGradient, [0,1], 0,this.h/6,0, this.h/2).drawRoundRect(0,0,this.w,this.h/2, this.h/4).endFill();
    this.background = new createjs.Shape(bkg);
    this.addChild(this.background);
    //write flag text
    //console.log("data = "+this.data);
    //console.log("data = "+this.data.keyboard_shortcut);
    //console.log("data color = "+this.data.color);
    this.text = new createjs.Text(this.data.name, "10px Arial", "#eeeeee"); //WARNING HARDCODED VALUE
    this.text.textAlign ="center";
    this.text.y = 1; //(this.h - 10 )/6; //WARNING HARDCODED VALUE
    this.text.x = this.w/2;
    this.addChild(this.text);
    //event handling
    this.onMouseOver = this._onMouseOver;
};
//checks the fields of the current value and 
//the new ones.
//will only accept an update if id corresponds
Section.prototype.update = function(new_data){
    //check input format, if json convert to object
    //TODO check id
    // if id matches
    // change the fields
    //launch event
    $(document).trigger("Annotatit:Event:Section:updated", this.data);
};
//Section.prototype.remove = function(){
//};

Section.prototype._tick = function () {
    this.Container_tick();
    ////console.log("Section Ticked");
};
Section.prototype._onMouseOver = function(e){
    //console.log("mouse over = "+e);
    //console.log("this = "+this);
    //set event listeners
    //this.onMouseOver = function(e){}; //this._onMouseOver; //do it in another way
    this.removeEventListener("mouseover");
    this.onMouseOut = this._onMouseOut;
    this.onClick = this._onMouseClick;
    //hack to bring to front
    var parent = this.parent;
    this.parent.removeChild(this);
    parent.addChild(this);

    //bring to front TODO
    //TODO 
    //modify color
    this.background.graphics.clear().beginLinearGradientFill(this._activeGradient, [0,1], 0,this.h/3,0, this.h).drawRoundRect(0,0,this.w,this.h, this.h/3).endFill();
    this.y = this.y -this.h/4;
    this.text.y = (this.h - 10 )/2; //WARNING HARDCODED VALUE
    //this.text.y = this.text.y +this.h/4 ;
    //this.y = this.y +this.h/2
    //update 
    $.event.trigger("Annotatit:Event:Section:mouse:over", this.data);
};

Section.prototype._onMouseOut = function(e){
    //console.log("mouse out = "+e);
    //console.log("this = "+this);
    this.background.graphics.clear().beginLinearGradientFill(this._bkgGradient, [0,1], 0,this.h/6,0, this.h).drawRoundRect(0,0,this.w,this.h/2, this.h/4).endFill();
    this.y = this.y +this.h/4;
    this.text.y = 1; //(this.h - 10 )/6; //WARNING HARDCODED VALUE
    //events
    this.onMouseOver = this._onMouseOver;
    this.removeEventListener("mouseout");
    this.removeEventListener("click");
    $.event.trigger("Annotatit:Event:Section:mouse:out", this.data);
};
Section.prototype._onMousePress = function(e){
    //console.log("mouse press = "+e);
    $.event.trigger("Annotatit:Event:Section:mouse:press", this.data);
};
Section.prototype._onMouseRelease = function(e){
    //console.log("mouse release = "+e);
    $.event.trigger("Annotatit:Event:Section:mouse:release", this.data);
};
Section.prototype._onMouseClick = function(e){
    //console.log("mouse click = "+e);
    $.event.trigger("Annotatit:Event:time:set", this.data.begin_time);
    $.event.trigger("Annotatit:Event:Section:mouse:click", this.data);
};



/////////////////////////////////////////////
//Cursor
/////////////////////////////////////////////
var Cursor = function(width, height, duration, color) {
  this.initialize(width, height, duration, color);
};
Cursor.prototype = new createjs.Container();
Cursor.prototype.Container_initialize = Cursor.prototype.initialize;
Cursor.prototype.Container_tick = Cursor.prototype._tick;
Cursor.prototype.initialize = function(width, height, duration, color) {
    this.Container_initialize();

    // add custom setup logic here.
    //set width, set height, 
    this.w = width;
    this.h = height;
    this.duration = duration;
    this.color = color;
    this.pps = width/duration;
    //create pointer
    this.pointer = new createjs.Shape();
	this.pointer.graphics.beginFill(color);
	this.pointer.graphics.moveTo(-4, 0);
	this.pointer.graphics.lineTo(4, 0);
	this.pointer.graphics.lineTo(0, 7);
	this.pointer.graphics.lineTo(-4, 0);
	//this.pointer.x = 4;
	//this.pointer.y = 0;
	//this.pointer.width = 7;
	//this.pointer.height = 7;
	this.addChild(this.pointer);
	//create line
	this.line = new createjs.Shape();
	this.line.graphics.setStrokeStyle(1).beginStroke(color);
	this.line.graphics.moveTo(0,0);
	this.line.graphics.lineTo(0,this.h);
	this.addChild(this.line);
    
//    this.x = 20;
};
Cursor.prototype._tick = function () {
    this.Container_tick();
};

//sets cursor position according to type argument.
// type can be either "time" or "position".
// "time" means that the x value is in time and has to
// be transformed to canvas coordinates, else no transformation is needed
Cursor.prototype.setPosition = function(type, x){
    if(type =="time"){
        this.x = x * this.pps;
    }else if(type == "position"){
        this.x = x;
    }else{
    
        console.log("Error, type is not 'position' or 'time', but is: "+type);
    }
};

/////////////////////////////////////////////
//CurrentTimeCursor
/////////////////////////////////////////////
var CurrentTimeCursor = function(width, height, duration) {
  this.initialize(width, height, duration, '#FF0011');
};
CurrentTimeCursor.prototype = new Cursor();
/////////////////////////////////////////////
//MouseFollowerCursor
/////////////////////////////////////////////
var MouseFollowerCursor = function(width, height, duration) {
  this.initialize(width, height, duration, '#11ff00');
};
MouseFollowerCursor.prototype = new Cursor();


/////////////////////////////////////////////
//TooltipContainer - 
// A container for the tooltips
// should be specialized for being able to display something
/////////////////////////////////////////////


var TooltipContainer = function(width, height) {
  this.initialize(width, height);
};
TooltipContainer.prototype = new createjs.Container();
TooltipContainer.prototype.Container_initialize = TooltipContainer.prototype.initialize;
TooltipContainer.prototype.Container_tick = TooltipContainer.prototype._tick;

//TooltipContainer.prototype.renderData = function(data){console.log("dummy render Data");};
//TooltipContainer.prototype.clearData = function(data){console.log("dummy clear Data");};


TooltipContainer.prototype.initialize = function(width, height) {
    //console.log("Initializes parent!");
    this.Container_initialize();
    this.parentContainer = null; 
    //this.visible = false; //if is visible or invisible
    this.w = width;
    this.h = height;
    this._bkgColor = "#262626";
    //THINGS THAT MUST BE DEFINED IN THE CHILD CLASS
    this.renderEvent = "";
    this.clearEvent = "";
    //this.renderData = null;
    //this.clearData = null;
    //END  -  THINGS THAT MUST BE DEFINED IN THE CHILD CLASS
    this.dataElements = new Array()
    var bkg = new createjs.Graphics().beginFill(this._bkgColor, [0,1], 0,this.h/3,0, this.h).drawRect(0,0,this.w,this.h).endFill();
    this.background = new createjs.Shape(bkg);
    this.addChild(this.background);

};
TooltipContainer.prototype._tick = function () {
    this.Container_tick();
    //console.log("TooltipContainer Ticked");
};

TooltipContainer.prototype.init = function () {
    this.parentContainer = this.parent;
    this.parentContainer.removeChild(this); // as should be invisible first
    //console.log("TooltipContainer Ticked");
    $(document).on(this.renderEvent, this, this._render);
};

TooltipContainer.prototype._render = function (e, data) {

    //console.log("tooltip render");
    //console.log("event = "+e);
    //console.log("event data = "+e.data);
    //console.log("event = "+data);
    //console.log("this object = "+this);
    //console.log("this keys = "+_.keys(this));
    //console.log("this values = "+_.values(this));
    e.data.renderData(data);
    //make this visible
    e.data.parentContainer.addChild(e.data);
    $(document).on(e.data.clearEvent, e.data , e.data._clear);
    $(document).off(e.data.renderEvent);

    //WHEN STAGE UPDATE ???? TODO
};

TooltipContainer.prototype._clear = function (e,data) {
    //console.log("tooltip clear");
    //console.log("event = "+e);
    //console.log("event data = "+e.data);
    //console.log("event = "+data);

    e.data.clearData(data);
    _.each(e.data.dataElements, function(e,i,l){this.removeChild(e);}, e.data );
    e.data.dataElements = new Array();
    //make this invisible
    e.data.parentContainer.removeChild(e.data);
    $(document).on(e.data.renderEvent,e.data, e.data._render);
    $(document).off(e.data.clearEvent);
    //WHEN STAGE UPDATE ???? TODO
};


/////////////////////////////////////////////
//SectionTooltip - 
// shows a section detail on overlay over the flags display
/////////////////////////////////////////////

var SectionTooltip = function(width, height) {
  this.initialize(width, height);
};
SectionTooltip.prototype = new TooltipContainer();
SectionTooltip.prototype.tooltip_initialize = TooltipContainer.prototype.initialize;
SectionTooltip.prototype.initialize = function(width, height) {
    //console.log("section tooltip start parent");
    this.tooltip_initialize(width, height);
    //console.log("section tooltip setup events");
    this.renderEvent = "Annotatit:Event:Section:mouse:over";
    this.clearEvent = "Annotatit:Event:Section:mouse:out";
    //console.log("section tooltip initialize OK");
};
SectionTooltip.prototype.renderData = function(data){
    //create all the display
    //user name
    var un = new createjs.Text( data.owner_name, "14px Arial", "#ffffee");
    //un.textAlign ="center";
    un.y = this.h/3;
    un.x = 2 ;
    this.addChild(un);
    this.dataElements.push(un);
    //thumbnail
    var bmp  = new createjs.Bitmap(data.owner_thumbnail_url);
    bmp.sourceRect = new createjs.Rectangle(0, 0, this.w/4, this.h - 4);
    bmp.y = 2;
    bmp.x = this.w/4 ;
    this.addChild(bmp);
    this.dataElements.push(bmp);
    // section name
    var sn = new createjs.Text( data.name, "12px Arial", "#ffffee");
    //sn.textAlign ="center";
    sn.y = this.h/4;
    sn.x = (this.w/4 )*2;
    this.addChild(sn);
    this.dataElements.push(sn);
    // color
    var bkg = new createjs.Graphics().beginFill(data.color).drawRect(0,0,this.w/5,this.h/3);
    var c = new createjs.Shape(bkg);
    c.y = this.h/2;
    c.x = (this.w/4 )*2;
    this.addChild(c);
    this.dataElements.push(c);
    // begin time
    var bt = new createjs.Text("begins at: " +_number2Time(data.begin_time), "12px Arial", "#ffffee");
    //bt.textAlign ="center";
    bt.y = this.h/4;
    bt.x = (this.w/4 )*3 ;
    this.addChild(bt);
    this.dataElements.push(bt);
    //end time
    var et = new createjs.Text("ends at: " +_number2Time(data.end_time), "12px Arial", "#ffffee");
    //et.textAlign ="center";
    et.y = (this.h/4 )*2;
    et.x = (this.w/4 )*3 ;
    this.addChild(et);
    this.dataElements.push(et);
};
SectionTooltip.prototype.clearData = function(data){
    //eliminate all interactions with the elements
    //not needed
};
//SectionTooltip.prototype.renderData = SectionTooltip.prototype._renderData;
//SectionTooltip.prototype.clearData = SectionTooltip.prototype._clearData;




/////////////////////////////////////////////
//FlagTooltip - 
// shows a flag detail on overlay over the sections display
/////////////////////////////////////////////


var FlagTooltip = function(width, height) {
  this.initialize(width, height);
};
FlagTooltip.prototype = new TooltipContainer();
FlagTooltip.prototype.tooltip_initialize = TooltipContainer.prototype.initialize;
//FlagTooltip.prototype = new GraphContainer(); 
FlagTooltip.prototype.initialize = function(width, height) {
    //console.log("flag tooltip start parent");
    this.tooltip_initialize(width, height);
    //console.log("flag tooltip setup events");
    this.renderEvent = "Annotatit:Event:Flag:mouse:over";
    this.clearEvent = "Annotatit:Event:Flag:mouse:out";
};

FlagTooltip.prototype.renderData = function(data){
    //console.log("FlagTooltip render data");
    //create all the display

    //media time
    var bt = new createjs.Text("At: " +_number2Time(data.media_time), "12px Arial", "#ffffee");
    bt.y = 2;
    bt.x = 2; 
    this.addChild(bt);
    this.dataElements.push(bt);
    //flag color
    var bkg = new createjs.Graphics().beginFill(data.flag_color).drawRect(0,0,20,10);
    var c = new createjs.Shape(bkg);
    c.y = this.h/4;
    c.x = 2;
    this.addChild(c);
    this.dataElements.push(c);
    //flag key
    var fk = new createjs.Text( data.keyboard_shortcut, "12px Arial", "#ffffee");
    //un.textAlign ="center";
    fk.y = this.h/4;
    fk.x = 25 ;
    this.addChild(fk);
    this.dataElements.push(fk);
    //flag text
    var ft = new createjs.Text( data.flag_name, "12px Arial", "#ffffee");
    //un.textAlign ="center";
    ft.y = this.h/2;
    ft.x = 2 ;
    this.addChild(ft);
    this.dataElements.push(ft);
    //user name
    var un = new createjs.Text( "By: "+data.owner_name, "14px Arial", "#ffffee");
    //un.textAlign ="center";
    un.y = (this.h/4 ) * 3;
    un.x = 2 ;
    this.addChild(un);
    this.dataElements.push(un);

    //thumbnail
    var bmp  = new createjs.Bitmap(data.owner_thumbnail_url);
    bmp.sourceRect = new createjs.Rectangle(0, 0, this.w/4, this.h - 4);
    bmp.y = 2;
    bmp.x = this.w/4 ;
    this.addChild(bmp);
    this.dataElements.push(bmp);

    // comment text
    var sn = new createjs.Text( data.text, "10px Arial", "#ffffee");
    //sn.textAlign ="center";
    sn.lineWidth = (this.w/3 *2);
    sn.y = 2; //this.h/4;
    sn.x = this.w/3 ;
    this.addChild(sn);
    this.dataElements.push(sn);


    //comment
    //can edit
    //can delete
};

FlagTooltip.prototype.clearData = function(data){
    //console.log("FlagTooltip clear data");
    //eliminate all interactions with the elements
};


/////////////////////////////////////////////
//DisplayBox, handles all the interactions
//and initialization
/////////////////////////////////////////////
var GraphDisplayBox = (function ($ ) {
    graphCanvas = "AnnotatItGraphCanvas";
    duration = 0;
    width = 0;
    height = 0;
    templateDiv = null;
    ajaxAddress = null;
    //sections = [];
    //flaggedComments = new Array();
    //sectionList = new Array();
    //canvas displays
    stage = null;
    canvas = null;
    ruler = null;
    flags = null;
    sections = null;
    currentTimeCursor = null;
    mouseFollowerCursor = null;
    sectionTooltip = null;// overlay over comments that shows the details of a section on section hover
    flagTooltip = null;// overlay over sections that shows the details of a flag on flag hover
    /*colors = {
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
    };*/
    _onMouseHover = function(e){
        //setup some things..
    };
    _onMouseMove = function(e){
        //update cursor position
        //console.log(e.stageX);
        //console.log(mouseFollowerCursor);
        mouseFollowerCursor.setPosition("position", e.stageX);
        stage.update();
        //set the cursor
        //emit signal telling the new cursor position
    };
    _onMouseOut = function(e){
        //update cursor position (send to 0 so it does not bother)
    };
    _onClick = function(e){
        //get the signaled time
        //send the signal that there was a click on that time 
        //WARNING ... maybe this should be handled by every graph container
        //cause they all have different behaviours
    };
    _init = function(){
        //////////////////////////////////////////////
        // Canvas and Stage
        //////////////////////////////////////////////
        //console.log("_init graph box");
        //create every component:
        var cvs = $("#"+graphCanvas);
        //console.log("canvas div width = "+cvs.width()) ;
        width = cvs.width();
        height = cvs.height();
        //console.log("canvas div height = "+cvs.height()) ;
        canvas = $("#"+graphCanvas).get(0);
        //console.log("canvas = "+canvas);
        stage = new createjs.Stage(canvas);
        //////////////////////////////////////////////
        //Display containers
        //////////////////////////////////////////////
        //  Ruler
        //console.log("_init "+duration);
        ruler = new Ruler(width,height*0.10,duration);
        stage.addChild(ruler);
        //stage.update();
        //  flags display
        flags = new FlagsDisplay(width,height*0.35,duration);
        flags.x = 0;
        flags.y = height*0.1;
        stage.addChild(flags);
        //stage.update();
        //  section display
        sections = new SectionsDisplay(width,height*0.55,duration);
        sections.x = 0;
        sections.y = height*0.45;
        stage.addChild(sections);
        //stage.update();
        //////////////////////////////////////////////
        //Cursors
        //////////////////////////////////////////////
        //  current time cursor
        currentTimeCursor = new CurrentTimeCursor(width,height,duration);
        //currentTimeCursor.setPosition("position", 20);
        stage.addChild(currentTimeCursor);
        //stage.update();
        //  mouse follower cursor
        mouseFollowerCursor = new MouseFollowerCursor(width,height,duration);
        //mouseFollowerCursor.setPosition("time", 60);
        stage.addChild(mouseFollowerCursor);
        //tooltips
        //section is OVER flags display
        //console.log("section tooltip create");
        sectionTooltip = new SectionTooltip(width,height*0.35,duration);
        sectionTooltip.x = flags.x;
        sectionTooltip.y = flags.y;
        stage.addChild(sectionTooltip);//here add it, but will be immediately removed
        sectionTooltip.init(); //this handles the saving of the parent, plus removal from the stage
        //flag is OVER sections display
        flagTooltip = new FlagTooltip(width,height*0.55,duration);
        flagTooltip.x = sections.x;
        flagTooltip.y = sections.y;
        stage.addChild(flagTooltip);//here add it, but will be immediately removed
        flagTooltip.init(); //this handles the saving of the parent, plus removal from the stage
        stage.update();
        //////////////////////////////////////////////
        //Event listeners
        //////////////////////////////////////////////
        stage.onMouseMove = function(e){ _onMouseMove(e);};
        stage.enableMouseOver();
    };
    
    return {
        updateTime : function(time){
            //check that input is time in seconds
            //console.log("update time graph canvas = " + time);
            currentTimeCursor.setPosition("time", time);
            stage.update();
        },
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
        init : function(d){ //TODO
            //get all the values from the server
            duration = d; //TODO transform duration in case it comes as String and not Number
            //get the div where Graph will be placed
            //set the width and height of the div
            //set the width and height of the canvas
            //check for dependencies. Is ocanvas loaded??
            //  if not, load it
            if(typeof createjs == "undefined") {
                console.log("loading EaselJS from CDN ...");
                $.getScript("http://code.createjs.com/easeljs-0.6.1.min.js", function() {
                 _init();
                });
            }else{
                _init();
            }
        },
        //filters the elements displayed
        filter : function(args){
            //TODO
            //apply the filter
            //over all the graphic containers
        },
        addObject : function(obj){
            //console.log("now setup object");
            //check that is object
            var data = obj;
            if (_.isString(obj)){
                //console.log("add object is string, asume and parse as JSON");
                //console.log(obj);
                data = $.parseJSON(obj);
            }
            
            if(_.isObject(data)){
                
                if( data.type == "FlaggedSyncComment"){
                    //console.log("is FlaggedSyncComment");
                    //console.log(flags);
                    flags.add(data);
                    return true;
                }
                if( obj.type == "Section"){
                    //console.log("is Section");
                    sections.add(data);
                    return true;
                }
            }
            //should never arrive to the end if data is correct            
            console.log("ERROR -addObject - creating new Element, input data is not array, string nor object type. Input object = "+obj);
            console.log(Object.prototype.toString.call(obj));
            return false; //TODO throw error
        },
        removeObject : function(obj){
            //console.log("now setup object");
            //check that is object
            var data = obj;
            if (_.isString(obj)){
                //console.log("add object is string, asume and parse as JSON");
                //console.log(obj);
                data = $.parseJSON(obj);
            }
            
            if(_.isObject(data)){
                
                if( data.type == "FlaggedSyncComment"){
                    //console.log("is FlaggedSyncComment");
                    //console.log(flags);
                    flags.remove(data);
                    return true;
                }
                if( obj.type == "Section"){
                    //console.log("is Section");
                    sections.remove(data);
                    return true;
                }
            }
            //should never arrive to the end if data is correct            
            console.log("ERROR -removeObject - removing Element, input data is not array, string nor object type. Input object = "+obj);
            console.log(Object.prototype.toString.call(obj));
            return false; //TODO throw error
        },
        //add a new object or list of objects to the display
        //assume that is list or object .. TODO deal with JSON later
        add : function(obj){
            //console.log("Add to graph display box");
            //console.log(obj);
            if(_.isArray(obj)){
                //console.log("is an array input");
                   //else assume it is an array of objects or json strings
                _.each(obj, function(e,i,l){ 
                                this.addObject(e);
                            },this);
            }else if(_.isObject(obj)){
                //console.log("is an object input");
                this.addObject(obj);
            }else /*if (_.isString(obj)){
                This should be JSON ... TODO
            }else*/ {
                console.log("ERROR - add- creating new Element, input data is not array, string nor object type. Input object = "+obj);
                return false; //TODO throw error
            }
            //if it is a string shoudl be JSON, parse it
            //check the type of the objects
            //then make the calls to all the containers to add data
            stage.update();
        },
        //updates a given object
        update : function(obj){
            // The easiest!
            this.remove(obj);
            this.add(obj);
        },
        //removes the given object from the list
        remove : function(obj){
            //console.log("Add to graph display box");
            //console.log(obj);
            if(_.isArray(obj)){
                //console.log("is an array input");
                   //else assume it is an array of objects or json strings
                _.each(obj, function(e,i,l){ 
                                this.removeObject(e);
                            },this);
            }else if(_.isObject(obj)){
                //console.log("is an object input");
                this.removeObject(obj);
            }else /*if (_.isString(obj)){
                This should be JSON ... TODO
            }else*/ {
                console.log("ERROR - remove- creating new Element, input data is not array, string nor object type. Input object = "+obj);
                return false; //TODO throw error
            }
            //if it is a string shoudl be JSON, parse it
            //check the type of the objects
            //then make the calls to all the containers to add data
            stage.update();
        }
    };
}($));


//console.log("graph_display_box loaded !!")


