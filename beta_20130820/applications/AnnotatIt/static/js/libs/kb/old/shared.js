////////////////////////
// Constant Variable //
////////////////////////

var ENTER_KEY = 13;


var number2txttime = function(time){
                var mtime = time;
                var ht = Math.floor(mtime/3600);
                var hh =  ht >0? ht+":" : "";
                ht = Math.floor((mtime - ht )/60);
                var mm = "00:";
                if (ht>0){
                    mm = ht>9? ht+":" : "0"+ht+":";
                }
                ht = (mtime%60).toFixed(2);
                var ss = "00";
                if (ht>0){
                    ss = ht>9? ht : "0"+ht;
                }
                return hh+mm+ss;
            };

var youtubeParser = function (url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[7].length==11){
        return match[7];
    }else{
        alert("Url incorrecta");
    }
}

var  parseMediaURL = function(url) {
    //TODO improve it, now only works with youtube.com and vimeo.com
    //TODO fix the error that I kind of hacked away adding a # 
    //TODO check if it works for vimeo
    //(url+"#").match(/^http:\/\/(?:.*?)\.?(youtube|vimeo)\.com\/(watch\?[^#]*v=(\w+)|(\d+)).+$/); //Does not work correctly
    (url+"#").match(/^http:\/\/(?:.*?)\.?(youtube|vimeo)\.com\/(watch\?[^#]*v=([^#\&\?]*)).+$/); //fixed for youtube
    return {
        provider : RegExp.$1,
        id : RegExp.$1 == 'vimeo' ? RegExp.$2 : RegExp.$3
    }
};

var getYoutubeThumbnailUrl = function(id){
    return 'http://img.youtube.com/vi/'+id+'/default.jpg';
};

var getThumbnail = function(url){
    var media = parseMediaURL(url);
    var ret = "/AnnotatIt/static/images/video_150.png";
    if (media.provider ==="youtube"){
        ret = 'http://img.youtube.com/vi/'+media.id+'/default.jpg';
    }
    return ret;
};

var copyToClipboardMessage = function(text) {
  window.prompt ("Copy to clipboard: Ctrl+C, Enter", text);
}
