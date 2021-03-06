//console.log("media_player_facade loading ...")

/* Documentation

This module defines an object called: "MediaPlayerFacade"
this object is the one that will interact with the corresponding media player (youtube, vimeo, etc)

When the media player has correctly loaded, this module triggers the:
"Annotatit:Event:MediaPlayerFacade:Ready"
event giving the MediaPlayerFacade object as extra parameter in the triggered event.

To subscribe to this event do:
var callback = function(evt, mediaPlayer){
    //do what you need here
}
$(document).on("Annotatit:Event:MediaPlayerFacade:Ready", callback );
to unsuscribe:
$(document).off("Annotatit:Event:MediaPlayerFacade:Ready" );


Time update Event:

$.event.trigger("Annotatit:Event:MediaPlayerFacade:time:update", currentTime  );
$(document).on("Annotatit:Event:MediaPlayerFacade:time:update",callback);
var callback = function(event, time){
    //event is the jQuery event 
    //time is the extra param, Number
}



This module exposes the following methods:

    ready 
    init 
    reset
    registerService
    unregisterService
    getDuration 
    getCurrentTime
    pause
    stop 
    seekTime
    seekAndPlay 
    playInterval 
    getThumbnailLink

To see more details on the API, check the docs on the definition of
MediaPlayerFacade on the return statement.

Note: this file extensively uses the Module Pattern
*/


var MediaPlayerFacade = (function ($ ) {

    availableServices = {}; //new Object(); //dictionary containing the services, each service is a registered object that can handle a media player
    serviceName = "None"; //current service name
    service = null; //current service, it might be youtube, vimeo, dailymotion, etc etc etc
    ready = false; //state of the media player. Is ready when the callback is don
    mediaPlayerNameTag = "MediaPlayerDiv";    
    onReadyCallback = function(){
        ready = true;
        //TODO emit signal: Event:MediaPlayerFacade:Ready
        $.event.trigger("Annotatit:Event:MediaPlayerFacade:Ready", this );
        //console.log("media shoud be ready");
    };
    
    return {
        //returns if the media player is ready (already loaded) or not yet
        ready : function() {
            return ready;
        },
        //inits the media player, needs the media service and the media ID to call
        // the corresponding player and API
        init : function(serviceName, mediaID){
            //check source
            //if source not in the services provided, return error message
            if( ! availableServices[serviceName]){
                return false;
            }
            //else
            //
            serviceName = serviceName;
            service = availableServices[serviceName];
            service.init(mediaID, onReadyCallback, mediaPlayerNameTag);
        },
        //resets the source and reinitializes the module to empty
        reset : function(){
            //currentTime = 0;
            //duration = 0;
            ready = false;
            servicesName = "None";
            service = null;
        },
        //registers a new service in the available services
        //if already available, replaces it
        // name of the service AND the instance that can handle it
        registerService : function(name, obj){
            if(! availableServices || availableServices == "undefined"){
                availableServices = new Object();
            }
            availableServices[name] = obj;
        },
        //erases a service from the service register
        //the name has to be a registered service
        unregisterService: function(name){
            try{
                if (serviceName == name) {
                    reset();
                }
                delete availableServices[name];
            }catch(err){
                console.log("Error unregistering service. Service "+name+" not available ");
                console.log("Error  = "+err);
            }
        },
        //NOTE the following methods could be created with a generator pattern, 
        //     one "template" function one array of tuples (name, param1, param2 ...) and a loop
        //creates a new object in the DB (if authorized)
        
        //duration of the media file in seconds
        getDuration : function(){
            if (service && ready){
                return service.getDuration();
            }else{
                console.log("service not set, can't call methods from null");
            }
        },
        //current time in seconds 
        getCurrentTime : function(){
            if (service && ready){
                return service.getCurrentTime();
            }else{
                console.log("service not set, can't call methods from null");
            }
        },
        //play the media
        play : function(){
            if (service && ready){
                return service.play();
            }else{
                console.log("service not set, can't call methods from null");
            }
        },
        //pause the media
        pause : function(){
            if (service && ready){
                return service.pause();
            }else{
                console.log("service not set, can't call methods from null");
            }
        },
        //stops the media (equals to pause + seekTime(0)
        stop : function(){
            if (service && ready){
                return service.stop();
            }else{
                console.log("service not set, can't call methods from null");
            }
        },
        // seeks the given time (in seconds) of a media file
        seekTime : function(time){
            if (service && ready){
                return service.seekTime(time);
            }else{
                console.log("service not set, can't call methods from null");
            }
        },
        //idem as seekTime but also starts to play
        seekAndPlay : function(time ){
            if (service && ready){
                return service.seekAndPlay(time);
            }else{
                console.log("service not set, can't call methods from null");
            }
        },
        //plays only an interval of the media file. Useful for playing sections
        playInterval : function(startTime, stopTime){
            if (service && ready){
                return service.playInterval(startTime, stopTime);
            }else{
                console.log("service not set, can't call methods from null");
            }
        },
        //returns the thumbnail of the video
        getThumbnailLink : function(){
            if (service && ready){
                return service.getThumbnailLink();
            }else{
                console.log("service not set, can't call methods from null");
            }
        }
    };
}($));
////////////////////////////////////////////////////////////////////////////////
//YouTube
////////////////////////////////////////////////////////////////////////////////
var YoutubeFacade = (function ( $, _ ) {
    serviceName = "youtube";
    currentTime = 0;
    duration = 0;
    ytplayer = null;
    mediaId = 0;
    onPlayerReadyCallback = null;
    mediaPlayerNameTag = "MediaPlayerDiv";
    shouldStop = false;
    stopOn = 0;
    // This function is called when an error is thrown by the player
    onPlayerError = function (errorCode) {
      alert("Youtube had an error Please reload the page. Error code = " + errorCode);
      //console.log("An error occured of type:" + errorCode);
    };

    // This function is called when the player changes state
    onPlayerStateChange  = function(newState) {
      updateHTML("playerState", newState);
    };

    // Display information about the current state of the player
    updatePlayerInfo =  function () {
      // Also check that at least one function exists since when IE unloads the
      // page, it will destroy the SWF before clearing the interval.
      if(ytplayer && ytplayer.getDuration) {
        currentTime = ytplayer.getCurrentTime();
        //duration = ytplayer.getDuration();
        //console.log("current time= "+currentTime);
        //send event of time passing!!! TODO
        //$.event.trigger({ type:"Annotatit:Event:MediaPlayerFacade:time:update", time: currentTime } );
        //changed to extra param in event handler call
        $.event.trigger("Annotatit:Event:MediaPlayerFacade:time:update", currentTime  );
        //check if should stop the video (for quotes)
        if(shouldStop){
            if( currentTime >= stopOn){
                shouldStop = false;
                ytplayer.pause();
            }
        }
      }
    };
   
    // This function is automatically called by the player once it loads
    onYouTubePlayerReady = function(playerId) {
      //console.log("Player loaded and ready, setting callbacks");
      ytplayer = document.getElementById("ytplayer"); //WARNING, do NOT replace document.get... by $() selector
      //console.log("ytplayer =  "+ytplayer);
      // This causes the updatePlayerInfo function to be called every 50ms to
      // get fresh data from the player
      setInterval(updatePlayerInfo, 50);
      //console.log("updating info ");
      updatePlayerInfo();
      //console.log("info updated");
      //ytplayer.addEventListener("onStateChange", "onPlayerStateChange");
      ytplayer.addEventListener("onError", "onPlayerError"); 
      //console.log("added listener ");
      //need to start playing to get video metadata.
      //NEED video metadata to get duration of the video for calculating the positions of tags and comments!!
      ytplayer.mute();
      // play video to get meta data until meta data is ready...needed mess :/
      //console.log("get duration ... ");
      ytplayer.playVideo();
      yt_get_duration = function(){
            if (ytplayer.getDuration() > 0) {
                ytplayer.pauseVideo();
                ytplayer.unMute();
                return ytplayer.getDuration();
            }
            // keep trying/waiting
            else {
                setTimeout(yt_get_duration[index], 150)
            }
        }
      duration = yt_get_duration();
      //duration = ytplayer.getDuration();
      //console.log("duration = "+duration);
      onPlayerReadyCallback();
    };
        
    loadPlayer = function (mediaId){
      //console.log("Loading Youtube Player");
      //console.log(mediaId);
      // The video to load
      var videoID = mediaId; 
      // Lets Flash from another domain call JavaScript
      var params = { allowScriptAccess: "always" };
      // The element id of the Flash embed
      var atts = { id: "ytplayer" };
      // All of the magic handled by SWFObject (http://code.google.com/p/swfobject/)
      //console.log("http://www.youtube.com/v/" + videoID + "?version=3&enablejsapi=1&playerapiid=player1");
      //console.log("swfobject = " + swfobject.embedSWF);
      //console.log("identifier = "+ mediaPlayerNameTag);
      swfobject.embedSWF("http://www.youtube.com/v/" + videoID + 
                         "?version=3&enablejsapi=1&playerapiid=player1&disablekb=1&iv_load_policy=3&modestbranding=1&rel=0", 
                         mediaPlayerNameTag, "520", "350", "9", null, null, params, atts);
      //console.log("finished setup of youtube player ... waiting to load");
    };
    
    return {
        //inits the 
        init : function(mediaID, onReadyCallback, tag){
            //console.log("INIT Youtube Player");
            //console.log(mediaID);
            //console.log(onReadyCallback);
            mediaId = mediaID;
            onPlayerReadyCallback = onReadyCallback;
            mediaPlayerNameTag = tag; 
            //create html tag object
            $("."+mediaPlayerNameTag).append('<object class="ytplayer" id="ytplayer" ></object>');
            if(typeof swfobject == "undefined") {
                //console.log("loading swfobject youtube lib ...");
                $.getScript("http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js", function() {
                    loadPlayer(mediaID);   
                });
            }else{
                //load player
                loadPlayer(mediaID);
            }
        },
        //resets the source and reinitializes the module
        reset : function(){
            currentTime = 0;
            duration = 0;
        },
        //duration of the media file in seconds or hh:mm:ss.mmmm
        getDuration : function(){
            return duration;
        },
        //current time in seconds or hh:mm:ss
        getCurrentTime : function(){
            return ytplayer.getCurrentTime();
        },
        play : function(){ytplayer.playVideo();},
        pause : function(){ytplayer.pauseVideo();},
        stop : function(){ytplayer.stopVideo();},
        seekTime : function(time){
            var ntime = time;
            if(_.isNumber(time )){
                ntime = time
            }else if(_.isString(time )){
                var t=time.split(":");
                ntime=Number(t[0])*3600+Number(t[1])*60+Number(t[2]);
            }
            ytplayer.seekTo(ntime, true);
        },
        seekAndPlay : function(time){
            seekTime(time);
            play();
        },
        //plays the specified interval of the media file
        playInterval : function(startTime, stopTime){
            var starttime = startTime;
            if(_.isString( startTime)){
                var t=startTime.split(":");
                starttime=Number(t[0])*3600+Number(t[1])*60+Number(t[2]);
            }
            seekAndPlay(starttime);
            //configure stop on stopTime
            var stoptime = stopTime;
            if(_.isString( stopTime)){
                var t=stopTime.split(":");
                stoptime=Number(t[0])*3600+Number(t[1])*60+Number(t[2]);
            }
            shouldStop = true;
            stopOn = stoptime;
        },
        getThumbnailLink : function(){
            return 'http://img.youtube.com/vi/'+mediaId+'/default.jpg';
        }
    };
}($, _ ));
////////////////////////////////////////////////////////////////////////////////
//VIMEO
////////////////////////////////////////////////////////////////////////////////
var VimeoFacade = (function ( $, _ ) {
    serviceName = "vimeo";
    currentTime = 0;
    duration = 0;
    vmplayer = null;
    mediaId = null;
    onPlayerReadyCallback = null;
    mediaPlayerNameTag = "MediaPlayerDiv"; 
    shouldStop = false;
    stopOn = 0;
    ///VIMEO specifics
    onPlayProgress = function(data, id) {
        //updateValue('video_time',Number(data.seconds));
        //updateTime('video_time',Number(data.seconds));
        currentTime = Number(data.seconds);
        //console.log("currentTime = "+currentTime);
        //$.event.trigger({ type:"Annotatit:Event:MediaPlayerFacade:time:update", time: currentTime } );
        //changed to extra param in event handler call
        $.event.trigger("Annotatit:Event:MediaPlayerFacade:time:update", currentTime  );
        //check if should stop the video (for quotes)
        if(shouldStop){
            if( currentTime >= stopOn){
                shouldStop = false;
                vmplayer.api('pause');
            }
        }
    };

    //awful hack to see WTF!!! is going on with duration that can not be set!!!
    //this WTF hack works .. so I let it this way for the moment
    durationReady = function(e){
        //console.log("WTF hack to see duration ="+duration);
        
        duration = e.duration;
        onPlayerReadyCallback();
    };
    initVimeoPlayer = function(){
        //check this
        var vmplayer_frame = $('#vmPlayer')[0];
        vmplayer = $f(vmplayer_frame);
        $(document).on("Annotatit:Event:MediaPlayerFacade:Internal:getDuration",this.durationReady);
        var obj = vmplayer.api('getDuration', function (value, player_id) {
                //$("#video_duration").text(value);
                //$("#video_duration").val(value);
                duration = value;
                //awful hack to see WTF!!! is going on with duration that can not be set!!!
                //this WTF hack works .. so I let it this way for the moment
                $.event.trigger({ type:"Annotatit:Event:MediaPlayerFacade:Internal:getDuration", duration: value } );
                //console.log("vimeo video duration = "+duration);
                });
        //console.log("dta from obj = "+obj.element);
        vmplayer.addEvent('playProgress', onPlayProgress);
        //onPlayerReadyCallback();
    };
    
    return {
        //inits the 
        init : function(mediaID, onReadyCallback, tag){
            //console.log("INIT Vimeo Player");
            //console.log(mediaID);
            //console.log(onReadyCallback);
            mediaId = mediaID;
            onPlayerReadyCallback = onReadyCallback;
            mediaPlayerNameTag = tag; 
            //create html tag object
            $("."+mediaPlayerNameTag).append('<iframe id="vmPlayer" src="http://player.vimeo.com/video/'+mediaId+'?api=1&player_id=vmPlayer" width="520" height="350" frameborder="0" ></iframe>');
            if(typeof $f == "undefined") { 
                $.getScript("http://a.vimeocdn.com/js/froogaloop2.min.js", function() {
                //load player
                var vmplayer_frame = $('#vmPlayer')[0];
                vmplayer = $f(vmplayer_frame);
                //console.log("handler = "+ vmplayer);
                vmplayer.addEvent('ready', initVimeoPlayer);
                //vmplayer.api('play');      
                });
            }else{
                //load player
                var vmplayer_frame = $('#vmPlayer')[0];
                vmplayer = $f(vmplayer_frame);
                //console.log("handler = "+ vmplayer);
                vmplayer.addEvent('ready', initVimeoPlayer);
                //vmplayer.api('play');      
            }
        },
        //resets the source and reinitializes the module
        reset : function(){
            currentTime = 0;
            duration = 0;
        },
        //duration of the media file in seconds or hh:mm:ss.mmmm
        getDuration : function(){
            vmplayer.api('getDuration', function (value, player_id) {
                duration = value;
                });
            return duration; //vmplayer.api('getDuration');
        },
        //current time in seconds or hh:mm:ss
        getCurrentTime : function(){
            return vmplayer.api('getCurrentTime');
        },
        play : function(){vmplayer.api('play');},
        pause : function(){vmplayer.api('pause');},
        stop : function(){vmplayer.api('pause'); seekTime(0);}, //there is no stop in the API
        seekTime : function(time){
            var ntime = time;
            if(_.isNumber(time )){
                ntime = time
            }else if(_.isString(time )){
                var t=time.split(":");
                ntime=Number(t[0])*3600+Number(t[1])*60+Number(t[2]);
            }
            vmplayer.api('seekTo', ntime);
        },
        seekAndPlay : function(time){
            seekTime(time);
            play();
        },
        //plays the specified interval of the media file
        playInterval : function(startTime, stopTime){
            var starttime = startTime;
            if(_.isString( startTime)){
                var t=startTime.split(":");
                starttime=Number(t[0])*3600+Number(t[1])*60+Number(t[2]);
            }
            seekAndPlay(starttime);
            //configure stop on stopTime
            var stoptime = stopTime;
            if(_.isString( stopTime)){
                var t=stopTime.split(":");
                stoptime=Number(t[0])*3600+Number(t[1])*60+Number(t[2]);
            }
            shouldStop = true;
            stopOn = stoptime;
        },
        getThumbnailLink : function(){
            //TODO
        }
    };
}($, _ ));

//REGISTER in facade services:
MediaPlayerFacade.registerService("youtube", YoutubeFacade);
MediaPlayerFacade.registerService("vimeo", VimeoFacade);


//console.log("Media player facade = " + MediaPlayerFacade);
//console.log("media_player_facade loaded !!")
