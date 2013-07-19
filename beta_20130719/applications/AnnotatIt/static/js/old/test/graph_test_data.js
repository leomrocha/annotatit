console.log("loading graph test data ...");

//individual Flag in JSON

var f1_json = '{ "type":"FlaggedSyncComment" ,"id":1, "owner_id": 1, "can_edit":true, "can_delete": true, "owner_name": "Leo", "owner_thumbnail_url": "http://localhost:5000/AnnotatIt/static/images/portrait_placeholder_90.png", "media_id":"a1", "parent_id":"", "media_time":15.2, "flag_name":"What", "keyboard_shortcut":"w", "flag_color":"#0000FF", "text":"Good punch!", "creation_datetime":"Wed Jul 3 14:17", "update_datetime":"Wed Jul 3 14:19" }';
//individual Flag Object
var f1_obj = $.parseJSON(f1_json);

//array flags in JSON
var arr1_json = [
    '{ "type":"FlaggedSyncComment" ,"id":2, "owner_id": 2, "can_edit":false, "can_delete": false,  "owner_name": "Leo", "owner_thumbnail_url": "http://localhost:5000/AnnotatIt/static/images/portrait_placeholder_90.png", "media_id":"a1", "parent_id":"", "media_time":57.3, "flag_name":"Good", "keyboard_shortcut":"g", "flag_color":"#00ff00", "text":"Good punch! ATGATHA ATHA TA AERF AR ARG AG AEFG AEG AR A ARG AG AG AREGAERGERGATHZTHYNBDH DGBSRTB BSGB SRTNBS BSYYNS RTB STBSRT SYNS RTB SNSRT SGNSGTN ", "creation_datetime":"Wed Jul 3 14:17", "update_datetime":"Wed Jul 3 14:19" }',
    '{ "type":"FlaggedSyncComment" ,"id":4, "owner_id": 3, "can_edit":false, "can_delete": true,  "owner_name": "Leo", "owner_thumbnail_url": "http://localhost:5000/AnnotatIt/static/images/portrait_placeholder_90.png", "media_id":"a1", "parent_id":"", "media_time":57.5, "flag_name":"Warning", "keyboard_shortcut":"!", "flag_color":"#ffff00", "text":"Good punch!", "creation_datetime":"Wed Jul 3 14:17", "update_datetime":"Wed Jul 3 14:19" }',
    '{ "type":"FlaggedSyncComment" ,"id":3, "owner_id": 4, "can_edit":true, "can_delete": false,  "owner_name": "Leo", "owner_thumbnail_url": "http://localhost:5000/AnnotatIt/static/images/portrait_placeholder_90.png", "media_id":"a1", "parent_id":"", "media_time":23.2, "flag_name":"Bad", "keyboard_shortcut":"b", "flag_color":"#ff0000", "text":"Good punch! ATGATHA ATHA TA AERF AR ARG AG AEFG AEG AR A ARG AG AG AREGAERGERGATHZTHYNBDH DGBSRTB BSGB SRTNBS BSYYNS RTB STBSRT SYNS RTB SNSRT SGNSGTN ", "creation_datetime":"Wed Jul 3 14:17", "update_datetime":"Wed Jul 3 14:19" }',
    '{ "type":"FlaggedSyncComment" ,"id":1, "owner_id": 4, "can_edit":true, "can_delete": true,  "owner_name": "Leo", "owner_thumbnail_url": "http://localhost:5000/AnnotatIt/static/images/portrait_placeholder_90.png", "media_id":"a1", "parent_id":"", "media_time":83.2, "flag_name":"Warning", "keyboard_shortcut":"!", "flag_color":"#ffff00", "text":" ARG AG AEFG AEG AR A ARG AG AG AREGAERGERGATHZTHYNBDH DGBSRTB BSGB SRTNBS BSYYNS RTB STBSRT SYNS RTB SNSRT SGNSGTN ", "creation_datetime":"Wed Jul 3 14:17", "update_datetime":"Wed Jul 3 14:19" }'
]
//array flags in object
//var arr1_obj = $.parseJSON(arr1_json);

//individual Section in JSON

var s1_json = '{ "type":"Section" ,"id":1, "owner_id": 1,  "can_edit":true, "can_delete": true, "owner_name": "Leo", "owner_thumbnail_url": "http://localhost:5000/AnnotatIt/static/images/portrait_placeholder_90.png", "media_id":"a1", "parent_id":"", "name":"Sect1", "color":"#0000FF", "begin_time":15.2, "end_time":60.2, "creation_datetime":"Wed Jul 3 14:17", "update_datetime":"Wed Jul 3 14:19" }';
//individual Section Object
var s1_obj = $.parseJSON(s1_json);

//array Sections in JSON
var sarr1_json = [
    '{ "type":"Section" ,"id":1, "owner_id": 1,  "can_edit":true, "can_delete": true, "owner_name": "Leo", "owner_thumbnail_url": "http://localhost:5000/AnnotatIt/static/images/portrait_placeholder_90.png", "media_id":"a1", "parent_id":"", "name":"Sect1", "color":"#0000FF", "begin_time":15.2, "end_time":60.2, "creation_datetime":"Wed Jul 3 14:17", "update_datetime":"Wed Jul 3 14:19" }',
    '{ "type":"Section" ,"id":1, "owner_id": 1,  "can_edit":true, "can_delete": true, "owner_name": "Leo", "owner_thumbnail_url": "http://localhost:5000/AnnotatIt/static/images/portrait_placeholder_90.png", "media_id":"a1", "parent_id":"", "name":"Sect2", "color":"#00ffFF", "begin_time":15.2, "end_time":60.2, "creation_datetime":"Wed Jul 3 14:17", "update_datetime":"Wed Jul 3 14:19" }',
    '{ "type":"Section" ,"id":1, "owner_id": 1,  "can_edit":true, "can_delete": true, "owner_name": "Leo", "owner_thumbnail_url": "http://localhost:5000/AnnotatIt/static/images/portrait_placeholder_90.png", "media_id":"a1", "parent_id":"", "name":"Sect3", "color":"#ff00FF", "begin_time":115.2, "end_time":160.2, "creation_datetime":"Wed Jul 3 14:17", "update_datetime":"Wed Jul 3 14:19" }',
    '{ "type":"Section" ,"id":1, "owner_id": 1,  "can_edit":true, "can_delete": true, "owner_name": "Leo", "owner_thumbnail_url": "http://localhost:5000/AnnotatIt/static/images/portrait_placeholder_90.png", "media_id":"a1", "parent_id":"", "name":"Sect4", "color":"#aa015F", "begin_time":30.2, "end_time":160.2, "creation_datetime":"Wed Jul 3 14:17", "update_datetime":"Wed Jul 3 14:19" }',
    '{ "type":"Section" ,"id":1, "owner_id": 1,  "can_edit":true, "can_delete": true, "owner_name": "Leo", "owner_thumbnail_url": "http://localhost:5000/AnnotatIt/static/images/portrait_placeholder_90.png", "media_id":"a1", "parent_id":"", "name":"Sect5", "color":"#524a58", "begin_time":55.2, "end_time":80.2, "creation_datetime":"Wed Jul 3 14:17", "update_datetime":"Wed Jul 3 14:19" }',
    '{ "type":"Section" ,"id":1, "owner_id": 1,  "can_edit":true, "can_delete": true, "owner_name": "Leo", "owner_thumbnail_url": "http://localhost:5000/AnnotatIt/static/images/portrait_placeholder_90.png", "media_id":"a1", "parent_id":"", "name":"Sect6", "color":"#aeafee", "begin_time":80.2, "end_time":100.2, "creation_datetime":"Wed Jul 3 14:17", "update_datetime":"Wed Jul 3 14:19" }',
    '{ "type":"Section" ,"id":1, "owner_id": 1,  "can_edit":true, "can_delete": true, "owner_name": "Leo", "owner_thumbnail_url": "http://localhost:5000/AnnotatIt/static/images/portrait_placeholder_90.png", "media_id":"a1", "parent_id":"", "name":"Sect7", "color":"#12eea5", "begin_time":250.2, "end_time":280.2, "creation_datetime":"Wed Jul 3 14:17", "update_datetime":"Wed Jul 3 14:19" }',
    '{ "type":"Section" ,"id":1, "owner_id": 1,  "can_edit":true, "can_delete": true, "owner_name": "Leo", "owner_thumbnail_url": "http://localhost:5000/AnnotatIt/static/images/portrait_placeholder_90.png", "media_id":"a1", "parent_id":"", "name":"Sect8", "color":"#d5c4e3", "begin_time":150.2, "end_time":170.2, "creation_datetime":"Wed Jul 3 14:17", "update_datetime":"Wed Jul 3 14:19" }'
]
//array Sections in object
var sarr1_obj = _.map(sarr1_json, $.parseJSON);