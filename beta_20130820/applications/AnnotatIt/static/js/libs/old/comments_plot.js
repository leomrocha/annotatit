(function($) {
    ///////////////////////////////
    // Comments Graph Plot //
    ///////////////////////////////
    
    console.log("defining CommentsPLot");

    //This var defines an scope of all the vars.
    if(! _.has($, "AnnotatIt")){
        $.AnnotatIt = {};
    }
    
    var AnnotatIt = $.AnnotatIt;
    
    //adding functionality not present in D3 
    //from: https://gist.github.com/trtg/3922684
    d3.selection.prototype.moveToFront = function() { 
        return this.each(function() {  this.parentNode.appendChild(this); }); 
    }; 
    /*
    circles.on("mouseover",function(){
      var sel = d3.select(this);
      sel.moveToFront();
    });
    */

    /**
     *
     *
     *
     *
     **/
    AnnotatIt.CommentsPlot = (function ($ ) {
            //properties
            self = null;
            //data to plot
            comments = [];
            sections = [];
            commentsCollection = null;
            sectionsCollection = null;
            //plot environment
            paper = null;
            backgroundRect = null;
            height = 0;
            width = 0;
            //properties for scale and position transformation
            tpadding = 25;
            //tpadding = 10;
            vpadding = 7;
            hpadding = 7;
            
            duration = 0;
            currentTime = 0;
            
            categories = 10, //arbitrary, but should be automated and should redraw if change 
            commentsHeight = 100,
            commentsPaddingTop = 30,
            sectionsCategories = 10, //arbitrary, but should be automated and should redraw if change 
            sectionsHeight = 120,
            sectionsPaddingTop = 120,
            
            cR = 3;
            sH = 5;
            
            xScale = null;
            xAxis = null;
            yScale = null;
            sectionYScale = null;
            yAxis = null;
            initialized = false;
            //properties for data drawing
            //dataWith = ;
            //dataHeight ;
            //time cursors
            cursors = null;
            currentTimeCursor = null;
            currentTimeText = null;
            mouseFollowerCursor = null;
            mouseFollowerText = null;
            //tooltips:
            commentTooltip = null;
            sectionTooltip = null;
            
            //private methods
            
            //Comments Data handling
            getColor = function(comment, index){
                return comment.get("flag_color");
            };
            getMediaTime = function(data,index){
                return data.get("media_time");
            };
            getBeginTime = function(data,index){
                return data.get("begin_time");
            };
            getEndTime = function(data,index){
                return data.get("end_time");
            };
            getKey = function(comment, index){
                //console.log("getting comment key");
                //console.log(comment);
                //var key = comment.get("id"); //Warning!! assuming comments is a Backbone Model!!
                //console.log(key);
                //return key;
                return comment.get("id"); //Warning!! assuming comments is a Backbone Model!!
            };
            
            getCenterX = function(data,index){
                //console.log("getting center of comment");
                //console.log(data);
                //var cx = data.get("media_time"); //Warning!! assuming comments is a Backbone Model!!
                //console.log(cx);
                //return xScale(cx);
                return xScale(data.get("media_time"));
            };
            
            yCounter = 0;
            getCenterY = function(data,index){
                return yScale( ( yCounter++ )%categories );
            };
            
            sectionsYCounter = 0;
            getSectionY = function(data,index){
                return sectionYScale( ( sectionsYCounter++ )%sectionsCategories );
            };
            
            
            getRadious = function(data,index){
                return ((height - (commentsPaddingTop*2))/(categories*4));
            };
            
            //Cursors
            onMediaTimeUpdate = function(event, time){
                //console.log("media time  update");
                //console.log(event,time);
                //console.log(time);
                //set x coordinates for 
                currentTime = time;
                var xpos = xScale(time);
                currentTimeCursor.attr("x1", xpos).attr("x2", xpos);
                currentTimeText.attr("x", xpos)
                                //.attr("y", 20)
                                .text(function(){ return number2txttime(currentTime) ;} );
            };
            updateCursors = function(){
                //get mouse coordinates
                //console.log("mousemove");
                var mpos = d3.mouse(this);
                //move mousefollowercursor
                mouseFollowerCursor//.transition()
                                   // .delay(50)
                                    .attr("x1", mpos[0])
                                    .attr("x2", mpos[0])
                //convert to time
                mouseFollowerText.attr("x", mpos[0])
                            //.attr("y", 20)
                            .text(function(){ return number2txttime(xScale.invert(mpos[0])) ;});
            };
            
            //jQuery events for API interface with external components
            seekTime = function(time){
                //console.log("seek Time: "+ time );
                $.event.trigger("Annotatit:Event:time:set", time);
            };
            activateMouseFollower = function(){
                //console.log("activating mouse follower");
                paper.on("mousemove",updateCursors);
            };
            deactivateMouseFollower = function(){
                //console.log("DEactivating mouse follower");
                paper.on("mousemove",null);
            };
            activateMouseClickOnPaper = function(){
                //console.log("activating mouse follower");
                paper.on("click",function(){ seekTime(xScale.invert( d3.mouse(this)[0]));} );
            };
            deactivateMouseClickOnPaper = function(){
                //console.log("DEactivating mouse follower");
                paper.on("click",null );
            };
            
            
            //public methods
            return {
                //helper functions (the ones that actually get the useful data from the input)
                //data updating methods
                //updates data to update
                //erases data that is not longer available
                updateAllComments : function(arrData){
                    //console.log("getting the arrData");
                    //console.log(arrData);
                    var allData = comments.selectAll("circle")
                            .data(arrData, getKey );
                    //console.log(allData);
                    //console.log("enter selection");
                    //console.log(allData.enter());
                    allData.enter()
                            .append('circle')
                            .attr("class","comment")
                            .attr("cx", getCenterX )
                            .attr("cy", getCenterY )
                            .attr("r", function(d,i){  return cR; } )
                            //.style("stroke", getColor)
                            .style("fill", getColor)
                            .on("mouseover", function(d,i){ 
                                    //console.log("mouseover = ");
                                    //console.log(d);
                                    //avoid event conflict with other events
                                    deactivateMouseFollower();
                                    deactivateMouseClickOnPaper();
                                    //change moouse cursor to finger pointer
                                    var sel = d3.select(this);
                                    //transition to bigger
                                    sel.transition().attr("r", 4*cR);
                                    //bring to front
                                    sel.moveToFront();
                                    //show tooltip
                                    //Get this bar's x/y values, then augment for the tooltip
                                    var mpos = d3.mouse(this);
                                    var pXpos = d3.event.pageX; //d3.select(this).attr("cx"); //
                                    var pYpos = d3.event.pageY; // d3.select(this).attr("cy"); //
                                    //console.log(mpos);
                                    var xpos = pXpos - mpos[0]/5; 
                                    //console.log("setted x = "+ xpos);
                                    var ypos = pYpos - mpos[1]/5;
                                    //console.log("setted y= "+ypos);
                                    //console.log("now setup position");

                                    //Update the tooltip position and value
                                    commentTooltip.style("left", xpos + "px")
                                              .style("top", ypos + "px");
                                    //console.log("fill the content");
                                    //console.log(commentTooltip.select('#content'));
                                    commentTooltip.select("#content")
                                                    .text( d.get("text") );
                                    commentTooltip.select("#media_time")
                                                    .text( number2txttime(d.get("media_time") ) );
                                    commentTooltip.select("#flag")
                                                    .text(d.get("flag_name"))
                                                    .style("background-color",d.get("flag_color"));
                                    commentTooltip.select("#user")
                                                    .text(d.user.get("nickname"));
                                    commentTooltip.select("#thumbnail")
                                                    .attr("src",d.user.get("image_link"));
                                    //console.log("now show the tooltip");
                                    //Show the tooltip
                                    commentTooltip.classed("tooltip_hidden", false);
                                    } )
                            .on("mouseout", function(d,i){
                                    //change mouse cursor to normal
                                    var sel = d3.select(this);
                                    //transition to smaller
                                    sel.transition().attr("r", cR);
                                    //reactivate other events in conflict
                                    activateMouseFollower();
                                    activateMouseClickOnPaper();
                                    //hide tooltip
                                    commentTooltip.classed("tooltip_hidden", true);
                                    } )
                            .on("click", function(d,i){
                                //console.log("comment clicked");
                                seekTime(getMediaTime(d));
                            });
                    allData.exit().remove();
                    return this;
                }, //./updateAllComments
                
                updateAllSections : function(arrData){
                    //console.log("getting the arrData");
                    //console.log(arrData);
                    var allData = comments.selectAll("rect")
                            .data(arrData, getKey );
                    allData.enter()
                            .append('rect')
                            .attr("class","section")
                            .attr("x",  function(d,i){   return xScale(d.get('begin_time')); } )
                            .attr("y", getSectionY )
                            .attr("width", function(d,i){ return xScale(d.get('end_time') - d.get('begin_time'));} )
                            .attr("height",  sH )
                            .style("fill", function(d,i){ return d.get('flag_color'); })
                            .on("mouseover", function(d,i){
                                    //console.log("mouseover = ");
                                    //console.log(d);
                                    //avoid event conflict with other events
                                    deactivateMouseFollower();
                                    deactivateMouseClickOnPaper();
                                    //change moouse cursor to finger pointer
                                    var sel = d3.select(this);
                                    //transition to bigger
                                    //var mvy = d3.select(this).attr("y") - yScale(0.5);
                                    sel.transition().attr("height", sH*4);
                                    //                .attr("y", mvy );
                                    //bring to front
                                    sel.moveToFront();
                                    //show tooltip
                                    //Get this bar's x/y values, then augment for the tooltip
                                    var mpos = d3.mouse(this);
                                    var pXpos = d3.event.pageX; //d3.select(this).attr("cx"); //
                                    var pYpos = d3.event.pageY; // d3.select(this).attr("cy"); //
                                    //console.log(mpos);
                                    var xpos = pXpos - mpos[0]/5; 
                                    //console.log("setted x = "+ xpos);
                                    var ypos = pYpos - mpos[1]/5;
                                    //console.log("setted y= "+ypos);
                                    //console.log("now setup position");

                                    //Update the tooltip position and value
                                    sectionTooltip.style("left", xpos + "px")
                                              .style("top", ypos + "px");
                                    //console.log("fill the content");
                                    //console.log(sectionTooltip.select('#content'));
                                    sectionTooltip.select("#name")
                                                    .text( d.get("name") );
                                    sectionTooltip.select("#begin_time")
                                                    .text( number2txttime(d.get("begin_time") ) );
                                    sectionTooltip.select("#end_time")
                                                    .text( number2txttime(d.get("end_time") ) );
                                    sectionTooltip.select("#flag")
                                                    .text(d.get("flag_name"))
                                                    .style("background-color",d.get("flag_color"));
                                    sectionTooltip.select("#user")
                                                    .text(d.user.get("nickname"));
                                    sectionTooltip.select("#thumbnail")
                                                    .attr("src",d.user.get("image_link"));
                                    //console.log("now show the tooltip");
                                    //Show the tooltip
                                    sectionTooltip.classed("tooltip_hidden", false);
                            })
                            .on("mouseout", function(d,i){
                                    //change mouse cursor to normal
                                    var sel = d3.select(this);
                                    //transition to smaller
                                    sel.transition().attr("height", sH);
                                    //var mvy = d3.select(this).attr("y") + yScale(1);
                                    //sel.transition().attr("height", cR*2)
                                    //                .attr("y", mvy );
                                    //reactivate other events in conflict
                                    activateMouseFollower();
                                    activateMouseClickOnPaper();
                                    //hide tooltip
                                    sectionTooltip.classed("tooltip_hidden", true);
                                    } )
                            .on("click", function(d,i){
                                //console.log("comment clicked");
                                seekTime(getBeginTime(d));
                            });

                    allData.exit().remove();
                    return this;
                }, //./updateAllSections
                
                
                //only adds elements (if not duplicated)
                add : function(arrData){
                //TODO
                    return this;
                }, //./add
                //only updates existing elements 
                update : function(arrData){
                //TODO
                    return this;
                }, //./update
                
                //only updates existing elements 
                remove : function(arrData){
                //TODO
                    return this;
                }, //./remove
                
                //Extra drawing methods
                
                //redraws the entire plot
                redraw : function(){
                //TODO
                    return this;
                }, //./redraw
                
                //setup the backbone collection model for easy update:
                setCommentsCollection : function(col){
                    commentsCollection = col;
                },
                setSectionsCollection : function(col){
                    sectionsCollection = col;
                },
                
                //update without sending a new array
                updateCommentsFromCollection : function(){
                    //console.log("updating from collection");
                    //console.log(commentsCollection);
                    var arr = commentsCollection.toArray();
                    //console.log(arr);
                    //console.log(self);
                    //console.log(this);
                    if(self){
                        //console.log("self");
                        //console.log(self);
                        self.updateAllComments(arr);
                    }
                    //console.log("finished updating");
                },
                //update without sending a new array
                updateSectionsFromCollection : function(){
                    //console.log("updating from collection");
                    //console.log(commentsCollection);
                    var arr = sectionsCollection.toArray();
                    if(self){
                        //console.log("self");
                        //console.log(self);
                        self.updateAllSections(arr);
                    }
                    //console.log("finished updating");
                },
                
                //some other 
                countContentCreators: function(arrData){
                    return this;
                },
                
                //init at the end or functions not already declared make a mess:
                init : function(w, h, d){
                    //console.log("initializing CommentsPlot");
                    //console.log("duration = "+duration);
                    //console.log("this.duration = "+this.duration);
                    paper = d3.select("#CommentsPlotDiv").append('svg').attr({
                                      'width': w,
                                      'height': h,
                                    });
                                    //.style('border', '1px solid black');
                    width = w;
                    height = h;

                    duration = d;
                    cR = getRadious();
                    //setup of background
                    backgroundRect = paper.append("g")
                                            .append("rect")
                                            .attr("class","section")
                                            .attr("rx", 6)
                                            .attr("ry", 6)
                                            .attr("x",  0 )
                                            .attr("y", 0 )
                                            .attr("width", width )
                                            .attr("height",  height )
                                            .style("fill", "white")
                                            .style("stroke", "#CCCCCC" );
                    //setup of scales and axes
                    xScale = d3.scale.linear()
                                        .domain([0, duration])
                                        .range([ 0+vpadding, width-vpadding]);
                    xAxis = d3.svg.axis()
                                      .scale(xScale)
                                      .orient("top")
                                      .ticks(5);
                    paper.append("g")
                                .attr("class", "axis")
                                .attr("transform", "translate(0," + tpadding + ")")
                                .call(xAxis);
                    yScale = d3.scale.linear()
                                        .domain([ 0, categories])
                                        .range([ commentsPaddingTop, sectionsPaddingTop]);
                                        //.range([ height - hpadding, tpadding]);
                    sectionYScale = d3.scale.linear()
                                        .domain([ 0, categories])
                                        .range([ sectionsPaddingTop, height - hpadding]);
                    /*
                    //Begin debug. Y axis is only for debugging purposes
                    yAxis = d3.svg.axis()
                                      .scale(yScale)
                                      .orient("left")
                                      .ticks(3);
                    paper.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(" + vpadding + ",0)")
                            .call(yAxis);
                    //END debug
                    */
                    //preparing the g tag where to put the comments
                    comments = paper.append('g').attr("class","comments");
                    //time cursors (current media time + mouse follower), should always be on the front
                    cursors = paper.append("g")
                            .attr("class", "cursors");
                            
                    //current media time cursor ... follows the update event from the media player
                    currentTimeCursor = cursors.append("line")
                                                .attr("class", "cursor")
                                                .attr("id", "mediaTimeCursor")
                                                .attr("x1", 50)
                                                .attr("y1", 10)
                                                .attr("x2", 50)
                                                .attr("y2", height)
                                                //.attr("color", '#ff1122')
                                                .style("stroke", '#ff1122');
                                                //.append("svg:title")
                                                //.text(function(d) { return xScale.invert(d.x1); });
                                                //.attr("", );
                    currentTimeText = cursors.append("text")
                                                  .attr("id", "cursorTime")
                                                  .attr("x", 10)
                                                  .attr("y", 10)
                                                  .attr("text-anchor", "middle")
                                                  .attr("font-family", "sans-serif")
                                                  .attr("font-size", "11px")
                                                  .attr("font-weight", "bold")
                                                  .attr("fill", "black")
                                                  .text(function(){ return number2txttime(currentTime) ;} );
                    //mouse follower cursor ... follows the mouse: onmousemove event
                    mouseFollowerCursor = cursors.append("line")
                                                .attr("class", "cursor")
                                                .attr("id", "mouseFollowerCursor")
                                                .attr("x1", 100)
                                                .attr("y1", 20)
                                                .attr("x2", 100)
                                                .attr("y2", height)
                                                //.attr("color", '#11ff22')
                                                .style("stroke", "#11ff22");

                    mouseFollowerText = cursors.append("text")
                                                  .attr("id", "cursorTime")
                                                  .attr("x", 100)
                                                  .attr("y", 20)
                                                  .attr("text-anchor", "middle")
                                                  .attr("font-family", "sans-serif")
                                                  .attr("font-size", "11px")
                                                  .attr("font-weight", "bold")
                                                  .attr("fill", "black")
                                                  .text(function(){ return number2txttime(100) ;});
                    commentTooltip = d3.select("#comment_tooltip");
                    sectionTooltip = d3.select("#section_tooltip");
                    //General  event handling
                    //paper.on("mousemove",updateCursors);
                    activateMouseFollower();
                    activateMouseClickOnPaper();
                    //External (jQuery) event handling
                    $(document).on("Annotatit:Event:MediaPlayerFacade:time:update", onMediaTimeUpdate);
                    $(document).on("Annotatit:Event:FSCommentsListVM:update", this ,this.updateCommentsFromCollection);
                    $(document).on("Annotatit:Event:SectionsListVM:update", this ,this.updateSectionsFromCollection);
                    initialized = true;
                    self = this;
                    return this;
                }, //./init
            };
        }($));
    

    //console.log("finished created comments plot class");

})(jQuery);




