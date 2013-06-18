var current_time = 0;

/*
 * Polling the player for information
 */

// Update a particular HTML element with a new value
function updateHTML(elmId, value) {
  document.getElementById(elmId).innerHTML = value;
}

function updateValue(elmId, val) {
  document.getElementById(elmId).value = val;
}

function updateTime(elmId, val) {
    val = Number(val);
    current_time = val;
    var hh = Math.floor(val/3600);
    var mm = Math.floor(val/60);
    var ss = val%60; 
    tval = hh.toString()+':'+mm.toString()+':'+ss.toString()
    document.getElementById(elmId).value = tval;
}
// This function is called when an error is thrown by the player
function onPlayerError(errorCode) {
  alert("An error occured of type:" + errorCode);
  console.log("An error occured of type:" + errorCode);
}

// This function is called when the player changes state
function onPlayerStateChange(newState) {
  updateHTML("playerState", newState);
}

// Display information about the current state of the player
function updatePlayerInfo() {
  // Also check that at least one function exists since when IE unloads the
  // page, it will destroy the SWF before clearing the interval.
  if(ytplayer && ytplayer.getDuration) {
    updateTime("video_time", ytplayer.getCurrentTime());
    updateInteractiveComments(ytplayer.getCurrentTime());
  }
}

// This function is automatically called by the player once it loads
function onYouTubePlayerReady(playerId) {
  //console.log("Player loaded and ready, setting callbacks");
  ytplayer = document.getElementById("ytPlayer");
  // This causes the updatePlayerInfo function to be called every 50ms to
  // get fresh data from the player
  setInterval(updatePlayerInfo, 50);
  updatePlayerInfo();
  //ytplayer.addEventListener("onStateChange", "onPlayerStateChange");
  ytplayer.addEventListener("onError", "onPlayerError");
  //need to start playing to get video metadata.
  //NEED video metadata to get duration of the video for calculating the positions of tags and comments!!
  ytplayer.mute();
  // play video to get meta data
  ytplayer.playVideo();
  yt_get_duration = function(){
        // if duration is available
        if (ytplayer.getDuration() > 0) {
            // pause video
            ytplayer.pauseVideo();
            // unmute
            ytplayer.unMute();
            // save duration
            return ytplayer.getDuration();

        }
        // else keep trying
        else {
            setTimeout(yt_get_duration[index], 150)
        }
    }
  var duration = yt_get_duration();
  //now init the visualization
  //init_canvas(); //deprecated
  init_interactive_canvas();
}

function loadPlayer(){
  //console.log("Loading Player");
  // The video to load
  var videoID = "{{=video.video_id}}"; 
  // Lets Flash from another domain call JavaScript
  var params = { allowScriptAccess: "always" };
  // The element id of the Flash embed
  var atts = { id: "ytPlayer" };
  // All of the magic handled by SWFObject (http://code.google.com/p/swfobject/)
  swfobject.embedSWF("http://www.youtube.com/v/" + videoID + 
                     "?version=3&enablejsapi=1&playerapiid=player1", 
                     "videoDiv", "720", "480", "9", null, null, params, atts);
}


function setVideoTime(time){
    //console.log("setting time");    
    //console.log(time);
    //this parses the string hh:mm:ss into values and 
    var t=time.split(":");
    ntime=Number(t[0])*3600+Number(t[1])*60+Number(t[2]);
    ytplayer.seekTo(ntime, true);
}

////////////////////////////////////////////////////////////////////////////////
//// On FORMS and tags actions
////////////////////////////////////////////////////////////////////////////////
function annotation_submit(){
    //console.log("summiting annotation");
    ajax("{{=URL('post_annotation',args=request.args(0))}}",
           ["video_id","video_time","comment"], 'annotation_response');
    var time_delay = Number(document.getElementById("time_delay_comments").innerHTML);
    //console.log("comment delay = "+time_delay);
    var json_response = new Object();
    ntime=current_time + time_delay;
    if (ntime<0){
        ntime = 0;
    }
    var hh = Math.floor(ntime/3600);
    var mm = Math.floor(ntime/60);
    var ss = ntime%60; 
    tval = hh.toString()+':'+mm.toString()+':'+ss.toString()
    json_response.video_time = tval; //
    if (json_response.video_time<0){
        json_response.video_time = 0;
    }
    json_response.comment = document.getElementById("comment").value;
    json_response.video_id = document.getElementById("video_id").value;
    canvas_draw_comment( json_response);
    return false;
}


function advice_submit(){
    console.log("summiting advice");
    ajax("{{=URL('post_advice',args=request.args(0))}}",
           ["annotation_video_id", "advice_text"], 'advice_response');
    //add advice to advice list TODO
    return false;
}

function pause_video(){
    if(ytplayer){
        ytplayer.pauseVideo();
    }
}

function on_comment(){
    pause_video();
    //set_comment_time();
    return false;
}

function on_tag(tag_type, evaluation){
    //set tag type name
    var tag_name = document.getElementById(tag_type).value; //innerHTML;
    //console.log("creating tag: "+ tag_name);
    document.getElementById("tag_type_name").value = tag_name;
    //set evaluation
    document.getElementById("evaluation").value = evaluation;
    //time = document.getElementById("video_time");
    //post_args = []
    ajax("{{=URL('post_tag',args="")}}",
           ["tag_type_name", "video_id","video_time","evaluation"], 'tag_response');
    //console.log(tag_name);
    //console.log(document.getElementById("time_delay_"+tag_name));
    var time_delay = Number(document.getElementById("time_delay_"+tag_name).innerHTML);
    //console.log("tag delay = "+time_delay);
    var json_response = new Object();
    ntime=current_time + time_delay;
    if (ntime<0){
        ntime = 0;
    }
    var hh = Math.floor(ntime/3600);
    var mm = Math.floor(ntime/60);
    var ss = ntime%60; 
    tval = hh.toString()+':'+mm.toString()+':'+ss.toString()
    json_response.video_time = tval; //
    //console.log("tag time = "+document.getElementById("video_time").value);
    //console.log("tag json_response.video_time = "+json_response.video_time);
    if (json_response.video_time<0){
        json_response.video_time = 0;
    }
    json_response.tag_type_name = document.getElementById("tag_type_name").value;
    json_response.evaluation = document.getElementById("evaluation").value;
    json_response.video_id = document.getElementById("video_id").value;
    canvas_draw_tag( json_response);
                   
    return false;
}

////////////////////////////////////////////////////////////////////////////////
//// NEW canvas things -- more interactive
////////////////////////////////////////////////////////////////////////////////

//Vars
///////////////////////

var all_comments = new Array();
var all_tags = new Array();
var all_canvas = new Object(); // {};
var interactive_canvas_div = $('#canvas_div');
//Functions
////////////////////////
function add_canvas(canvas_name, field_name){
    //find where to put the canvas
    // add the canvas object to DOM
    var canvas_text = '<canvas id="'+canvas_name+'" width="720" height="30"></canvas>';
    //console.log('canvas_text = '+canvas_text);
    interactive_canvas_div.append("<div ><h4>"+field_name+"</h4> </div>");
    /*del_tag =  "<div id='"+field_name+"_del_tag_option' > </div>"
    tag_options = ""
    //change_tag = "<div id='"+field_name+"_change_tag_option' > "+ tag_options+"  </div>"
    time_display = "<div id='"+field_name+"_time_display' > </div>"
    menu_options = del_tag + change_tag
    canvas_menu = "<div id='canvas_menu_"+field_name+"' > "+ menu_ options +" </div>"
    */
    interactive_canvas_div.append();
    interactive_canvas_div.append(canvas_text);
    //console.log('init oCanvas for this instance');
    // init ocanvas 
    var canvas = oCanvas.create({
	    canvas: "#"+canvas_name,
	    background: "#EEF",
    });
    //console.log('adding to canvas dict');
    all_canvas[canvas_name] = canvas;
    //console.log('DONE');
    // done
}

function canvas_draw_tag( tag_json ){
    //console.log("drawing tag");
    //console.log("drawing tag json "+ tag_json);
    //console.log("drawing tag keys"+ Object.getOwnPropertyNames(tag_json));
    //console.log("tag_json.tag_type_name = "+tag_json.tag_type_name);
    tag_json.tag_type_name = tag_json.tag_type_name.replace(" ","_"); // TODO sanitize strings names!!!!
    //console.log("tag_json.evaluation = "+tag_json.evaluation);
    //console.log("tag_json.video_time = "+tag_json.video_time);
    var canvas_name = tag_json.tag_type_name+"_canvas";// document.getElementById("tags_canvas");
    //console.log(" canvas name "+ canvas_name);
    try{
        if(!all_canvas[canvas_name] ){
            add_canvas(canvas_name, tag_json.tag_type_name);
        }
    }
    catch(err){
        console.log(err);
        add_canvas(canvas_name, tag_json.tag_type_name);
    }
    //get canvas
    var canvas = all_canvas[canvas_name];
    //console.log("canvas = "+canvas);
    //console.log("canvas_name = "+canvas_name);
    //get coordinates
    var t=tag_json.video_time.split(":");
    var ntime=Number(t[0])*3600+Number(t[1])*60+Number(t[2]);
    ytplayer = document.getElementById("ytPlayer");
    var duration = ytplayer.getDuration();
    //console.log("duration = "+duration);
    //console.log(ntime);
    var xpos =  (ntime/duration ) * 720;
    var ypos = 0;
    //set image source according to result
    var img_src="{{=URL('static','images/QUESTION_icon_20px.png')}}";
    if (tag_json.evaluation=="OK"){
        img_src="{{=URL('static','images/OK_icon_20px.png')}}"
        ypos = 0;
    }else if(tag_json.evaluation=="WARNING"){
        img_src="{{=URL('static','images/WARNING_20px.png')}}"
        ypos = 5;
    }else if(tag_json.evaluation=="BAD"){
        img_src="{{=URL('static','images/BAD_icon_20px.png')}}"    
        ypos = 10;
    }else if(tag_json.evaluation=="QUESTION"){
        img_src="{{=URL('static','images/QUESTION_icon_20px.png')}}"
        ypos = 5;
    }
    //console.log(xpos);
    //console.log(ypos);
    //draw tag on canvas
    var tag_obj = canvas.display.image({
	    x: xpos,
	    y: ypos,
	    //origin: { x: "center", y: "center" },
	    image: img_src,
	    height: 20,
	    width: 20,
	    opacity: 0.6,
    });
    canvas.addChild(tag_obj);
    //bind calls 
    tag_obj.bind("click tap", function () {
	        on_tag_click(canvas, this, tag_json);
	        
        });
    tag_obj.bind("mouseenter touchenter", function () {
	        on_tag_enter(canvas, this, tag_json);
	        
        });
    tag_obj.bind("mouseleave touchleave", function () {
	        on_tag_leave(canvas, this, tag_json, ypos);
        });
}
/*
function canvas_draw_all_tags(tags){
    //console.log('drawing all tags');
    //console.log(tags);
    for (var i = 0, len = tags.length; i < len; ++i) {
                //console.log("JSON object: ");
                //console.log(tags[i]);
                canvas_draw_tag(tags[i]);
            }
    //console.log('DONE drawing tags');
}
*/
//function get_tags(callback){
function get_tags(){
    //get the tags from dtabase, AJAX call
    //console.log('getting tags by AJAX call');
    //var parsed = null;
    jQuery.ajax({
           type: "POST",
           url: '{{=URL("get_tags")}}',
           data: "video_id={{=video.id}}"
        }).done(function( msg ) {
            //console.log(msg);
            var parsed = jQuery.parseJSON(msg);
            all_tags = parsed;
            for (var i = 0, len = parsed.length; i < len; ++i) {
                //console.log("JSON object: ");
                //console.log(parsed[i]);
                canvas_draw_tag( parsed[i] );
                
            }
            //console.log("callback");
            //callback(parsed);
          });
        return false;
    //for every tag, draw it
    //return parsed_tags;
}

function on_tag_enter(canvas, obj, tag_json){
    //console.log("tag enter");
    //set cursor to arrow
    document.body.style.cursor = 'pointer';
    canvas.removeChild(obj);
    canvas.addChild(obj);
    obj.animate({
		        width: 30,
		        height: 30,
		        y: 0,
		        opacity: 1,
		        }, 350);
    //display time
    //console.log("obj = "+tag_json.video_time);
    $("#canvas_time_display").text(tag_json.video_time);
}

function on_tag_leave(canvas, obj, tag_json, ypos){
    //console.log("tag leave");
    //set cursor to arrow
    document.body.style.cursor = 'default';
    obj.animate({
		        width: 20,
		        height: 20,
		        y: ypos,
		        opacity: 0.6,
	        }, 350);
}

function on_tag_click(canvas, obj, tag_json){
    //console.log("tag click");
    setVideoTime(tag_json.video_time);
    //play;
    if(!ytplayer){
        ytplayer = document.getElementById("ytPlayer");
        }
    ytplayer.playVideo();
}


function canvas_draw_comment(comment_json){
 //console.log("drawing comment");
    //console.log("drawing comment json "+ comment_json);
    //console.log("drawing comment keys"+ Object.getOwnPropertyNames(comment_json));
    //console.log("comment_json.video_time = "+comment_json.video_time);
    //select the correct canvas to draw in (name)
    //if canvas does not exist
    //  add_canvas
    //  select canvas
    //draw
    var canvas_name = "Comments_canvas";// document.getElementById("tags_canvas");
    //console.log(" canvas name "+ canvas_name);
    if(!all_canvas[canvas_name] ){
        add_canvas(canvas_name, "Comments");
        //for interactive display
        interactive_canvas_div.append("<div id='comments_interactive_show'> <span id='canvas_comment_time_display'></span> | <span id='canvas_comment_text_display'></span> </div>");
        interactive_canvas_div.append("");
    }
    //get canvas
    var canvas = all_canvas[canvas_name];
    //console.log(" canvas  "+ canvas);
    //get coordinates
    var t=comment_json.video_time.split(":");
    var ntime=Number(t[0])*3600+Number(t[1])*60+Number(t[2]);
    ytplayer = document.getElementById("ytPlayer");
    var duration = ytplayer.getDuration();
    //console.log("duration = "+duration);
    //console.log(ntime);
    var xpos =  (ntime/duration ) * 720;
    var ypos = 0;
    //set image source according to result
    var img_src="{{=URL('static','images/comment_icon_20px.png')}}";
    //console.log(xpos);
    //console.log(ypos);
    //console.log(img_src);
    //draw tag on canvas
    var com_obj = canvas.display.image({
	    x: xpos,
	    y: ypos,
	    //origin: { x: "center", y: "center" },
	    image: img_src,
	    height: 20,
	    width: 20,
	    opacity: 0.6,
    });
    canvas.addChild(com_obj);
    //bind calls 
    com_obj.bind("click tap", function () {
	        on_comment_click(canvas, this, comment_json);
	        
        });
    com_obj.bind("mouseenter touchenter", function () {
	        on_comment_enter(canvas, this, comment_json);
	        
        });
    com_obj.bind("mouseleave touchleave", function () {
	        on_comment_leave(canvas, this, comment_json);
        });
    
}

function canvas_draw_all_comments(comments){
    //for each comment:
    //  create comment object on canvas  
    //  draw comment
}

function get_comments(){

    //get the tags from dtabase, AJAX call
    //console.log('getting comments by AJAX call');
    //var parsed = null;
    jQuery.ajax({
           type: "POST",
           url: '{{=URL("get_comments")}}',
           data: "video_id={{=video.id}}"
        }).done(function( msg ) {
            ////console.log(msg);
            var parsed = jQuery.parseJSON(msg);
            all_comments = parsed;
            for (var i = 0, len = parsed.length; i < len; ++i) {
                //console.log("JSON object: ");
                //console.log(parsed[i]);
                canvas_draw_comment( parsed[i] );
                
            }
            //console.log("callback");
            //callback(parsed);
          });
        return false;
}

function on_comment_enter(canvas, obj, comment_json){
    //console.log("comment enter");
    //set cursor to arrow
    document.body.style.cursor = 'pointer';
    canvas.removeChild(obj);
    canvas.addChild(obj);
    obj.animate({
		        width: 30,
		        height: 30,
		        y: 0,
		        opacity: 1,
		        }, 350);
    $("#canvas_time_display").text(comment_json.video_time);
    $("#canvas_comment_time_display").text(comment_json.video_time);
    $("#canvas_comment_text_display").text(comment_json.comment);
}

function on_comment_leave(canvas, obj, comment_json, ypos){
    //console.log("comment leave");
    //set cursor to arrow
    document.body.style.cursor = 'default';
    obj.animate({
		        width: 20,
		        height: 20,
		        y: ypos,
		        opacity: 0.6,
	        }, 350);
}

function on_comment_click(canvas, obj, comment_json){
    //console.log("comment click");
    setVideoTime(comment_json.video_time);
    //play;
    if(!ytplayer){
        ytplayer = document.getElementById("ytPlayer");
        }
    ytplayer.playVideo();
}

function updateInteractiveComments(time){
    //TODO make update of comments that are around the time 
    // ...need for a good algorithm
}

function change_time_delay(td, tag_name){
    //console.log("change time delay "+ td);
    //console.log("change time delay "+ time_delay);
    var time_delay = Number(document.getElementById("time_delay_"+tag_name).innerHTML)+td;
    document.getElementById("time_delay_"+tag_name).innerHTML = time_delay;
    //console.log("change time delay "+ time_delay);
}

////////////////////////////////////////////////////////////////////////////////
////INIT
////////////////////////////////////////////////////////////////////////////////

//init functions for interactive canvas 

function init_interactive_canvas() {
    console.log('INIT interactive canvas');
    //get tagging options TODO
    //draw interactive tagging canvas TODO
    console.log('getting comments');
    var comments = get_comments();
    console.log('getting tags');
    var tags = get_tags();
    console.log('DONE init interactive canvas');

}

