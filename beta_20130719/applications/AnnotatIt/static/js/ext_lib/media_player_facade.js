console.log("media_player_facade loading ...")

var mediaPlayerNameTag = "MediaPlayerDiv";


var MediaPlayerFacade = (function ($ ) {
    //currentTime = 0;
    //duration = 0;
    availableServices = {}; //new Object(); //dictionary containing the services, each service is a registered object that can handle a media player
    serviceName = "None"; //current service name
    service = null; //current service, it might be youtube, vimeo, dailymotion, etc etc etc
    ready = false; //state of the media player. Is ready when the callback is don
    
    onReadyCallback = function(){
        ready = true;
        //TODO emit signal: Event:MediaPlayerFacade:Ready
        $().trigger("Annotatit:Event:MediaPlayerFacade:Ready", this);
    };
    
    return {
        ready : function() {
            return ready;
        },
        //inits the 
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
            service.init(mediaID, onReadyCallback);
        },
        //resets the source and reinitializes the module
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
        unregisterService: function(name){
            try{
                if (serviceName == "name") {
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
        
        //duration of the media file in seconds or hh:mm:ss
        getDuration : function(){
            if (service && ready){
                return service.getDuration();
            }else{
                console.log("service not set, can't call methods from null");
            }
        },
        //current time in seconds or hh:mm:ss
        getCurrentTime : function(){
            if (service && ready){
                return service.getCurrentTime();
            }else{
                console.log("service not set, can't call methods from null");
            }
        },
        play : function(){
            if (service && ready){
                return service.play();
            }else{
                console.log("service not set, can't call methods from null");
            }
        },
        pause : function(){
            if (service && ready){
                return service.pause();
            }else{
                console.log("service not set, can't call methods from null");
            }
        },
        stop : function(){
            if (service && ready){
                return service.stop();
            }else{
                console.log("service not set, can't call methods from null");
            }
        },
        seekTime : function(time){
            if (service && ready){
                return service.seekTime(time);
            }else{
                console.log("service not set, can't call methods from null");
            }
        },
        seekAndPlay : function(time ){
            if (service && ready){
                return service.seekAndPlay(time);
            }else{
                console.log("service not set, can't call methods from null");
            }
        },
        playInterval : function(startTime, stopTime){
            if (service && ready){
                return service.playInterval(startTime, stopTime);
            }else{
                console.log("service not set, can't call methods from null");
            }
        },
        getThumbnailLink : function(){
            if (service && ready){
                return service.getThumbnailLink();
            }else{
                console.log("service not set, can't call methods from null");
            }
        }
    };
}($));

var YoutubeFacade = (function ( $, _ ) {
    serviceName = "youtube";
    currentTime = 0;
    duration = 0;
    ytplayer = null;
    mediaId = 0;
    onPlayerReadyCallback = null;
    
    // This function is called when an error is thrown by the player
    onPlayerError = function (errorCode) {
      alert("An error occured of type:" + errorCode);
      console.log("An error occured of type:" + errorCode);
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
      }
    };
   
    // This function is automatically called by the player once it loads
    onYouTubePlayerReady = function(playerId) {
      //console.log("Player loaded and ready, setting callbacks");
      ytplayer = document.getElementById("ytplayer");
      // This causes the updatePlayerInfo function to be called every 50ms to
      // get fresh data from the player
      setInterval(updatePlayerInfo, 50);
      updatePlayerInfo();
      //ytplayer.addEventListener("onStateChange", "onPlayerStateChange");
      ytplayer.addEventListener("onError", "onPlayerError");
      //need to start playing to get video metadata.
      //NEED video metadata to get duration of the video for calculating the positions of tags and comments!!
      ytplayer.mute();
      // play video to get meta data until meta data is ready...needed mess :/
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
      onPlayerReadyCallback();
    };
        
    loadPlayer = function (mediaId){
      console.log("Loading Youtube Player");
      //console.log(mediaId);
      // The video to load
      var videoID = mediaId; 
      // Lets Flash from another domain call JavaScript
      var params = { allowScriptAccess: "always" };
      // The element id of the Flash embed
      var atts = { id: "ytplayer" };
      // All of the magic handled by SWFObject (http://code.google.com/p/swfobject/)
      swfobject.embedSWF("http://www.youtube.com/v/" + videoID + 
                         "?version=3&enablejsapi=1&playerapiid=player1", 
                         "videoDiv", "520", "350", "9", null, null, params, atts);
    };
    
    return {
        //inits the 
        init : function(mediaID, onReadyCallback){
            console.log("INIT Youtube Player");
            console.log(mediaID);
            console.log(onReadyCallback);
            mediaId = mediaID;
            onPlayerReadyCallback = onReadyCallback;
            //create html tag object
            $("."+mediaPlayerNameTag).append('<object class="ytplayer" id="ytplayer" ></object>');
            //TODO this one will be later ... for the moment I load everything just in case
            //TODO Load JS library from vendor
            if(typeof swfobject == "undefined") {
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
        },
        //current time in seconds or hh:mm:ss
        getCurrentTime : function(){
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
            //TODO
        },
        getThumbnailLink : function(){
            return 'http://img.youtube.com/vi/'+mediaId+'/default.jpg';
        }
    };
}($, _ ));


var VimeoFacade = (function ( $, _ ) {
    serviceName = "vimeo";
    currentTime = 0;
    duration = 0;
    vmplayer = null;
    mediaId = 0;
    onPlayerReadyCallback = null;
    
    ///VIMEO specifics
    onPlayProgress = function(data, id) {
        //updateValue('video_time',Number(data.seconds));
        //updateTime('video_time',Number(data.seconds));
        currentTime = Number(data.seconds);
    };

    initVimeoPlayer = function(){
        //check this
        var vmplayer_frame = $('#vmPlayer')[0];
        vmplayer = $f(vmplayer_frame);
        var obj = vmplayer.api('getDuration', function (value, player_id) {
                $("#video_duration").text(value);
                $("#video_duration").val(value);
                video_duration = value;
                });
        //console.log("dta from obj = "+Object.keys(obj));
        vmplayer.addEvent('playProgress', onPlayProgress);
        onReadyCallback();
    };
    
    return {
        //inits the 
        init : function(mediaID, onReadyCallback){
            console.log("INIT Vimeo Player");
            console.log(mediaID);
            console.log(onReadyCallback);
            mediaId = mediaID;
            onPlayerReadyCallback = onReadyCallback;
            //TODO this one will be later ... for the moment I load everything just in case
            //TODO Load JS library from vendor
            //create html tag object
            $("."+mediaPlayerNameTag).append('<iframe id="vmPlayer" src="http://player.vimeo.com/video/'+mediaId+'?api=1&player_id=vmPlayer" width="520" height="350" frameborder="0" ></iframe>');
            if(typeof $f == "undefined") { //TODO check that froogaloop is loaded, else load
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
            //TODO
        },
        //current time in seconds or hh:mm:ss
        getCurrentTime : function(){
        },
        play : function(){vmplayer.api('play');},
        pause : function(){vmplayer.api('pause');},
        stop : function(){vmplayer.api('stop');},
        seekTime : function(time){
            var ntime = time;
            if(_.isNumber(time )){
                ntime = time
            }else if(_.isString(time )){
                var t=time.split(":");
                ntime=Number(t[0])*3600+Number(t[1])*60+Number(t[2]);
            }
            //TODO seek time
        },
        seekAndPlay : function(time){
            seekTime(time);
            play();
        },
        //plays the specified interval of the media file
        playInterval : function(startTime, stopTime){
            //TODO
        },
        getThumbnailLink : function(){
            //TODO
        }
    };
}($, _ ));

//REGISTER in facade services:
MediaPlayerFacade.registerService("youtube", YoutubeFacade);
MediaPlayerFacade.registerService("vimeo", VimeoFacade);


console.log("Media player facade = " + MediaPlayerFacade);
console.log("media_player_facade loaded !!")
