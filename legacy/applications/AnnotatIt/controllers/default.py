# -*- coding: utf-8 -*-

#########################################################################
## This is a samples controller
## - index is the default action of any application
## - user is required for authentication and authorization
## - download is for downloading files uploaded in the db (does streaming)
## - call exposes all registered services (none by default)
#########################################################################
from urlparse import urlparse, parse_qs
import json
helpers = local_import('helpers')
from helpers import *
from gluon.validators import *

def index():
    """

    """
    return dict()

def media_not_found():
    '''
    On media not found
    '''
    return dict()

def unallowed():
    '''
    Not having permissions to see a file
    '''
    return dict()

def video_not_found():
    '''
    On video not found
    '''
    return dict()

##############################################################
#CRUD MEDIA pages with its web services, ajax and email senders
##############################################################


#######
# PAGE
#######

#@auth.requires_login()
def embed_media():
    """
    Page for embedding media by an iframe
    """
    #print "embed media print test"
    #generate page only ... the things will happen by ajax.
    #get media embed code from request
    _key = request.args(0, cast=str)#youtube videoID
    #print "_key ="
    #print str(_key)    
    _media = db(db.media.media_embed_key == _key).select(
                                                    db.media.id,    
                                                    db.media.owner_id,
                                                    db.media.title,
                                                    db.media.subtitle,
                                                    db.media.media_id,
                                                    db.media.media_network,
                                                    db.media.media_url,
                                                    db.media.privacy,
                                                    db.media.view_permissions,
                                                    db.media.creation_datetime,
                                                    db.media.update_datetime
                                                    ).first()
    #comments =  [ (owner_thumb, owner's link, parent_id, media_time, flag_name, flag_color, text, creation_datetime) ]
    #_comments = db( (db.auth_user.id == db.flagged_comment.owner_id) &(db.flagged_comment.media_id == _media.id) ).select()
    #_sections = db( (db.auth_user.id == db.section.owner_id) &(db.section.media_id == _media.id) ).select()
                                        
    #print "_media ="
    #print str(_media)
    #print "query print test "
    #print str()
    if not _media:
        redirect(URL('media_not_found'))
    #owner ?
    if auth.user_id == _media.owner_id:
        return dict(media = _media,
                    #comments = _comments,
                    #sections = _sections,
                    )
    #public ?
    if _media.view_permissions == "all":
        return dict(media = _media,
                    #comments = _comments,
                    #sections = _sections,
                    )
    #individuals
    if _media.view_permissions == "authorized_people":
        #check permissions of current user
        #TODO check that this actually works ... TEST        
        if (not  db( (db.view_media_access_email.media_id == _media.id ) & (db.view_media_access_email.email == auth.user.email  ) ).isempty() ):
            return dict(media = _media,
                    #comments = _comments,
                    #sections = _sections,
                    )
        #return redirect(URL("unallowed") )
    if _media.view_permissions == "authorized_groups":
        #TODO implement group checking
        return redirect(URL("unallowed") )    
        #return dict(media = _media,
        #            comments = _comments,
        #            sections = _sections,
        #            )
    #this should not arrive due to the first if
    #if _media.view_permissions == "only_me" and auth.user_id == _media.owner_id:
    #    return dict(media = _media)
    #check if media can be embedded
    #Maybe I can do everything from here, but I rather have more control
    return redirect(URL("unallowed") )


@auth.requires_login()
def add_media():
    """
    Page for adding media for a user
    """
    #generate page only ... the things will happen by ajax.
    #Maybe I can do everything from here, but I rather have more control
    return dict()


@auth.requires_login()
def my_media():
    """
    Page for adding media for a user
    """
    my_media = db(db.media.owner_id == auth.user_id).select()
    can_annotate = db(db.annotate_media_access_email.email == auth.user.email).select()
    can_view = db(db.view_media_access_email.email == auth.user.email).select()
    return dict(
                my_media = my_media,
                can_annotate = can_annotate,
                can_view = can_view
                )


###############
# WEB SERVICES
###############


#######
# AJAX
#######

@auth.requires_login()
def ajax_add_media():
    """
    Add media link for external service
    """
    #print "add media"
    #print "request = "+str(request.vars)
    #TODO check request method is PUT
    #if (request.env.request_method != "PUT"):
    #    return "{ response:error, response-detail: Invalid request}"
    if (not IS_URL(request.vars.link) or request.vars.link.strip()==""):
        #print "ERROR incorrect url"
        #return json.dumps( { "response":"error", "response-detail": "URL not valid. Try with a Vimeo or Youtube link"} )
        response.flash = "URL not valid. Try with a Vimeo or Youtube link"
    service =  get_service(request.vars.link)
    #print "1"
    #print service
    permissions = get_permissions(request.vars)
    #print "2"
    #print permissions
    if not permissions:
        #print "ERROR permissions not set"
        #return json.dumps( { "response":"error", "response-detail": "Permissions are not worreclty set"} )
        response.flash = "Permissions are not worreclty set"
    if not request.vars.title or request.vars.title.strip() =="" :
        #print "ERROR title not set"
        #return json.dumps( { "response":"error", "response-detail": "You need to write a title"} )
        response.flash = "You need to write a title"
    reg = {"title": request.vars.title.strip()}
    #print "3"
    #print reg
    reg.update(service)
    #print "4"
    #print reg
    reg.update(permissions)
    #print "5"
    #print reg
    #print "inserting record"
    try:
        query_add_media = db.media.insert(**reg)
        #print "6"
        #print "isnert success!!!"
    except Exception as err:
        #print "Error inserting record"
        #print err
        return None
    #print "7"
    #print "query result = "+str(query_add_media)
    #check that link validates
    #obtain the service of the link
    # if seccess return the links
    new_media = db.media(db.media.id == query_add_media)
    #print "8"
    #print "creating permissions"
    if permissions['view_permissions'] == "authorized_people":
        invited = parse_permissions(request.vars.invited_annotators, new_media.id, "view")
        for i in invited:
            db.view_media_access_email.insert(
                                                  media_id = new_media.id,
                                                  email = i
                                                    )
    if permissions['annotation_permissions'] == "authorized_people":
        invited = parse_permissions(request.vars.invited_annotators, new_media.id, "annotation")
        for i in invited:
            db.annotate_media_access_email.insert(
                                                  media_id = new_media.id,
                                                  email = i
                                                    )
    #print "sending emails invites to people"
    #TODO send invites, this should go to another process, not the main that should return instantly
    
    return response.json( new_media )

@auth.requires_login()
def ajax_upload_media():
    """
    User will upload a file
    """
    #TODO after setting up storage service
    pass

@auth.requires_login()
def ajax_delete_media():
    """
    User will upload a file
    """
    #read the request
    #print "Delete request: "
    if (request.env.request_method != "DELETE"):
        #return json.dumps( { "response":"error", "response-detail": "Invalid request"} )
        response.flash = "Invalid Request"
    #print request
    #print request.vars
    #check that the requester is the owner of the record
    media_record = db(db.media.id == int(request.vars.media_id) ).select().first()
    #print media_record
    if not media_record.owner_id == auth.user_id:
       #return json.dumps( { "response":"error", "response-detail": "You do not own this record, you can not delete it"} )
       response.flash = "You do not own this record, you can not delete it"
    #else
    db(db.media.id == int(request.vars.media_id) ).delete()
    #print "check: "
    #print media_record
    #print db(db.media.id == int(request.vars.media_id) ).select().first()
    #TODO find all the records that point to this one and delete or mark them as deleted
    return response.json(media_record)

@auth.requires_login()
def ajax_set_permissions():
    """
    Sets annotate/view permissions by default
    private, public, unlisted
    ##NOTE shoud have been set before
    """
    pass

@auth.requires_login()
def ajax_set_viewers():
    """
    Adds groups to the current media file
    """
    pass

@auth.requires_login()
def ajax_set_annotators():
    """
    Adds annotators to the current media file
    Annotators can be groups OR single users (emails or user ids)
    """
    pass


    
############################################################
#  END  - ADD MEDIA page and web services
############################################################
    
    
#########################################################################
#Invites, by massimo di piero in a post here:
# http://www.mail-archive.com/web2py@googlegroups.com/msg78529.html

#def invite():
#    form = SQLFORM(db.invite)
#    db.invite.uuid.default=str(uuid.uuid4())
#    if form.process().accepted:
#         auth.mailer.send(to=form.vars.email,
#                          message = db.invite.uuid.default)
#    return dict(form=form)

########### end invites

#########################################################################





#########################################################################
#########################################################################
#########################################################################
#########################################################################
##LEGACY
#########################################################################
#########################################################################


#########################################################################
#Login Not needed
#########################################################################

def embed_youtube_video():
    """
    the page can be embedded in an iframe
    """
    
    """
    Shows the list of uploaded videos
    """
    #if(not auth.user):
    #    redirect(URL('index'))
    _video_id = request.args(0, cast=str)#youtube videoID
    _video = db(db.video.video_id == _video_id)(db.video.video_network == "YOUTUBE").select()[0]
    if not _video:
        redirect(URL('video_not_found'))
    #check for permissions of individual and group to actually see the video, else show not allowed 
    return dict(
                video = _video,
                )


def embed_vimeo_video():
    """
    the page can be embedded in an iframe
    """
    #if(not auth.user):
    #    redirect(URL('index'))
    _video_id = request.args(0, cast=str)#youtube videoID
    _video = db(db.video.video_id == _video_id)(db.video.video_network == "YOUTUBE").select()[0]
    if not _video:
        redirect(URL('video_not_found'))
    #check for permissions of individual and group to actually see the video, else show not allowed 
    return dict(
                video = _video,
                )
    return dict()


    
def results():
    """
    results page for a certain video, only shows the results, no possibility 
    of annotation
    """
    return dict()



#########################################################################
#Login Required
#########################################################################


@auth.requires_login()
def videos_by():
    """
    Shows the list of My uploaded videos,
    And options to update, modify and erase them
    """
    #check that the user has permission to see what he sees
    #if(not auth.user):
    #    redirect(URL('index'))
    
    user_id = request.args(0, cast=int)#youtube user id
    _videos = db(db.videos.person_id == user_id)(db.video.video_network == "YOUTUBE").select()
    #TODO should check also for permissions of the user cheking the video
    
    return dict(
                videos = _videos,
                )



@auth.requires_login()
def videos():
    """
    Shows me a list of all the videos I have the right to see
    """
    #if(not auth.user):
    #    redirect(URL('index'))
    _videos = db(db.video.person_id == auth.user_id).select()
    
    return dict(
                videos = _videos,
                )

@auth.requires_login()
def my_videos():
    """
    Shows the list of My uploaded videos,
    And options to update, modify and erase them
    """
    #if(not auth.user):
    #    redirect(URL('index'))
    _ytvideos = db(db.video.person_id == auth.user_id)(db.video.video_network == "YOUTUBE").select()
    _vvideos = db(db.video.person_id == auth.user_id)(db.video.video_network == "VIMEO").select()
    return dict(
                youtube_videos = _ytvideos,
                vimeo_videos = _vvideos,
                )


#TODO  change this to an ajax service AND make it for other services too (soundcloud)
@auth.requires_login()
def upload_video():
    """
    Form to upload a new video (in fact, for the moment is only add a video from youtube)
    """
    uform=FORM('Title: ',
              INPUT(_name='title', requires=IS_NOT_EMPTY()),
              'Video Link: ',
              INPUT(_name='link', requires=IS_NOT_EMPTY()),
              INPUT(_type='submit'),
              formname='simple_upload_video_form')
    if uform.process(formname='simple_upload_video_form').accepted:
        #os.system("echo 'upload form fields: "+str(uform.vars)+" '")
        url_data = urlparse(uform.vars.link)
        #os.system("echo 'url_data: "+str(url_data)+" '")
        #now check if youtube or vimeo
        if (url_data[1].lower().find("youtube") >=0 ):
            query = parse_qs(url_data.query)
            #os.system("echo 'query: "+str(query)+" '")
            video_id = query["v"][0]
            db.video.insert(title = uform.vars.title,
                                     video_id= video_id,
                                     video_network="YOUTUBE",
                                     full_url = uform.vars.link,
                                    )
        elif (url_data[1].lower().find("youtu.be") >=0 ):
            vid = url_data.path.split("/")
            video_id =  vid[-1] if len(vid[-1]) > 0 else vid[-2]
            db.video.insert(title = uform.vars.title,
                                     video_id= video_id,
                                     video_network="YOUTUBE",
                                     full_url = uform.vars.link,
                                    )
        elif (url_data[1].lower().find("vimeo") >=0 ):
            ##treat like youtube and save data on youtube db Table
            vid = url_data.path.split("/")
            video_id =  vid[-1] if len(vid[-1]) > 0 else vid[-2]
            db.video.insert(title = uform.vars.title,
                                     video_id= video_id,
                                     video_network="VIMEO",
                                     full_url = uform.vars.link,
                                    )
        else:
            #fail!!
            pass
        #response.flash = 'form accepted'
        pass
    elif uform.errors:
        response.flash = 'form has errors, please check'
    else:
        #response.flash = 'please fill out the form'
        pass
    return dict(
                upload_form = uform,
                )


#############################
#AJAX calls
#############################

def get_tags():
    """
    ajax call for the view_video view for commenting on a video 
    with the fast annotation system
    """
    #os.system("echo ' getting tags "+str(request.vars)+"'")
    if (request.vars.video_id):
        rows = db(db.tag.video_id == request.vars.video_id).select();
        #os.system("echo ' tags get "+str(rows)+"'")
        return response.json(rows)
    else:
        return None


def get_comments():
    """
    ajax call for the view_video view for commenting on a video 
    with the fast annotation system
    """
    #os.system("echo ' getting comments "+str(request.vars)+"'")
    if (request.vars.video_id):
        rows = db(db.annotations.video_id == request.vars.video_id).select(orderby=db.annotations.video_time);
        #os.system("echo ' comments get "+str(rows)+"'")
        return response.json(rows)
    else:
        return None


@auth.requires_login() 
def post_annotation():
    """
    ajax call for the view_video view for commenting on a video
    """
    form = SQLFORM(db.annotations,showid = False,
                    fields=['video_id','video_time', 'comment'],)
    form.vars.annotator_id = auth.user_id
    #os.system("echo 'post annotation form.vars "+str(form.vars)+"'")
    #os.system("echo 'post annotatino request.vars "+str(request.vars)+"'")
    #os.system("echo 'post annotatino auth.user_id "+str(auth.user_id)+"'")
    if form.accepts(request, formname=None):
        response.flash = T('Your comment has been successfully posted')
        #os.system("echo 'everything OK'")
        #return DIV(T("Comment posted"))
        #return DIV(BEAUTIFY(form.vars))
        return None
    elif form.errors:
        #os.system("echo 'form has errors OK'")
        return TABLE(*[TR(k, v) for k, v in form.errors.items()])


@auth.requires_login() 
def post_advice():
    """
    ajax call for the view_video view for commenting on a video
    """
    form = SQLFORM(db.advice,showid = False,
                    fields=[ 'advice_text'],)
    #os.system("echo advice vars: '"+str(request.vars)+"'")
    form.vars.annotator_id = auth.user_id
    #os.system("echo advice form.vars: '"+str(form.vars)+"'")
    form.vars.video_id = request.vars.annotation_video_id
    if form.accepts(request, formname=None):
        response.flash = T('Your advice has been successfully posted')
        #return DIV(T("Comment posted"))
        return DIV(BEAUTIFY(form.vars))
        #return None
    elif form.errors:
        return TABLE(*[TR(k, v) for k, v in form.errors.items()])

@auth.requires_login()
def post_tag():
    """
    ajax call for the view_video view for commenting on a video 
    with the fast annotation system
    """
    form = SQLFORM(db.tag,showid = False,
                    fields=['tag_type_name', 'video_id','evaluation','video_time'],)
    form.vars.annotator_id = auth.user_id
    #os.system("echo 'post tag "+str(form.vars)+"'")
    #os.system("echo 'post tag request "+str(request)+"'")
    #os.system("echo 'post tag request vars "+str(request.vars)+"'")
    #os.system("echo 'post tag "+str(auth.user_id)+"'")
    #try:
    if form.accepts(request, formname=None):
        response.flash = T('Tagged')
        #os.system("echo 'tag OK'")
        #return DIV(T("Comment posted"))
        return DIV(BEAUTIFY(form.vars))
        #return None
    elif form.errors:
        #os.system("echo 'tag has errors'")
        return TABLE(*[TR(k, v) for k, v in form.errors.items()])
    #except Exception as e:
    #    #os.system("echo 'There was an exception and is crazy'")
    #    #os.system("echo 'Exception = "+str(e)+"'")
        

@auth.requires_login()
def modify_comment():
    """
    ajax call for the view_video view for modifying a fast commenting on a video 
    with the fast annotation system
    """
    if(request.vars.annotator_id and int(request.vars.annotator_id) != auth.user_id):
        return False
    aid = auth.user_id
    if (request.vars.annotator_id):
        aid = request.vars.annotator_id
    #this fixes a BUG that happens due to time text format
    vt = request.vars.video_time
    svt = vt.split(':')
    tsvt = []
    #os.system("echo ' 3'")
    for i in svt:
        if len(i)<2:
            i = '0'+i
        tsvt.append(i)
    vt = ':'.join(tsvt)
    #os.system("echo 'vt "+str(vt)+"'")
    row = db(
                db.annotations.video_id == request.vars.video_id and 
                db.annotations.annotator_id == aid and 
                db.annotations.comment == request.vars.comment and 
                db.annotations.video_time == vt 
                ).update(comment = request.vars.new_comment)
    #os.system("echo 'row "+str(row)+"'")
    ret = db.annotations(
                db.annotations.video_id == request.vars.video_id and 
                db.annotations.annotator_id == aid and 
                db.annotations.comment == request.vars.new_comment and 
                db.annotations.video_time == vt
                )
    #os.system("echo 'ret "+str(ret)+"'")
    return response.json(ret)

    
@auth.requires_login()
def delete_comment():
    """
    ajax call for the view_video view for deleting a fast commenting on a video 
    with the fast annotation system
    """
    if(request.vars.annotator_id and int(request.vars.annotator_id) != auth.user_id):
        return False
    aid = auth.user_id
    if (request.vars.annotator_id):
        aid = request.vars.annotator_id
    #this fixes a BUG that happens due to time text format
    vt = request.vars.video_time
    svt = vt.split(':')
    tsvt = []
    #os.system("echo ' 3'")
    for i in svt:
        if len(i)<2:
            i = '0'+i
        tsvt.append(i)
    vt = ':'.join(tsvt)
    #os.system("echo 'vt "+str(vt)+"'")
    ret = db(
                db.annotations.video_id == request.vars.video_id and 
                db.annotations.annotator_id == aid and 
                db.annotations.comment == request.vars.comment and 
                db.annotations.video_time == vt 
                ).delete()
    #os.system("echo 'ret "+str(ret)+"'")
    return ret

@auth.requires_login()
def modify_tag():
    """
    ajax call for the view_video view for modifying a fast commenting on a video 
    with the fast annotation system
    """
    #check the user is the one who created the comment or tag or the owner of the video
    #os.system("echo 'delete tag '")
    #os.system("echo 'request.vars "+str(request.vars)+"'")
    #there are two cases, when the tag is being done by the current user and modified, and when the tag
    #was loaded from the DB, in the first case annotator_id will not exist, so assume that is the same as the logged in user
    #Field('tag_type_id', 'reference tag_type', requires=IS_NOT_EMPTY()),#will belong to a tag (e.g. hesitation)
    if(request.vars.annotator_id and int(request.vars.annotator_id) != auth.user_id):
        return False
    aid = auth.user_id
    if (request.vars.annotator_id):
        aid = request.vars.annotator_id
    #this fixes a BUG that happens due to time text format
    vt = request.vars.video_time
    svt = vt.split(':')
    tsvt = []
    #os.system("echo ' 3'")
    for i in svt:
        if len(i)<2:
            i = '0'+i
        tsvt.append(i)
    vt = ':'.join(tsvt)
    #os.system("echo 'vt "+str(vt)+"'")
    row = db(db.tag.tag_type_name == request.vars.tag_type_name and
                db.tag.video_id == request.vars.video_id and 
                db.tag.annotator_id == aid and 
                db.tag.evaluation == request.vars.evaluation and 
                db.tag.video_time == vt 
                ).update(evaluation = request.vars.new_evaluation)
    #os.system("echo 'row "+str(row)+"'")
    ret = db.tag(db.tag.tag_type_name == request.vars.tag_type_name and
                db.tag.video_id == request.vars.video_id and 
                db.tag.annotator_id == aid and 
                db.tag.evaluation == request.vars.new_evaluation and 
                db.tag.video_time == vt 
                )
    #os.system("echo 'ret "+str(ret)+"'")
    return response.json(ret)
    
@auth.requires_login()
def delete_tag():
    """
    ajax call for the view_video view for deleting a fast commenting on a video 
    with the fast annotation system
    """
    #check the user is the one who created the comment or tag or the owner of the video
    #os.system("echo 'delete tag '")
    #os.system("echo 'request.vars "+str(request.vars)+"'")
    #there are two cases, when the tag is being done by the current user and modified, and when the tag
    #was loaded from the DB, in the first case annotator_id will not exist, so assume that is the same as the logged in user
    #Field('tag_type_id', 'reference tag_type', requires=IS_NOT_EMPTY()),#will belong to a tag (e.g. hesitation)
    #os.system("echo 'annotator "+str(request.vars.annotator_id)+"'")
    #os.system("echo 'user_id "+str(auth.user_id)+"'")
    #os.system("echo ' type annotator "+str(type(request.vars.annotator_id))+"'")
    #os.system("echo ' type user_id "+str(type(auth.user_id))+"'")
    #os.system("echo 'compare "+str(auth.user_id != request.vars.annotator_id)+"'")
    #os.system("echo 'compare "+str(auth.user_id == request.vars.annotator_id)+"'")
    if(request.vars.annotator_id and int(request.vars.annotator_id) != auth.user_id):
        return False
    aid = auth.user_id
    if (request.vars.annotator_id):
        aid = request.vars.annotator_id
   #this fixes a BUG that happens due to time text format
    vt = request.vars.video_time
    svt = vt.split(':')
    tsvt = []
    for i in svt:
        if len(i)<2:
            i = '0'+i
        tsvt.append(i)
    vt = ':'.join(tsvt)
    ret = db(db.tag.tag_type_name == request.vars.tag_type_name and
                db.tag.video_id == request.vars.video_id and 
                db.tag.annotator_id == aid and 
                db.tag.evaluation == request.vars.evaluation and 
                db.tag.video_time == vt 
                ).delete()
    return ret
    
#############################
#############################

#@auth.requires_login() #TODO make user authentication control here!!! .. for the moment a link is needed
def view_video(): #youtube Videos TODO, refactor name, but for the moment live it that way (there are some people depending on the name)
    """
    Shows the list of uploaded videos
    """
    #if(not auth.user):
    #    redirect(URL('index'))
    _video_id = request.args(0, cast=str)#youtube videoID
    
    _video = db(db.video.video_id == _video_id)(db.video.video_network == "YOUTUBE").select()[0]
    if not _video:
        redirect(URL('video_not_found'))
    #os.system("echo 'video =  "+str(_video)+"'")
    #os.system("echo 'video.id =  "+str(_video.id)+"'")
    #_annotations = db(db.annotations.video_id == _video.id).select(orderby=db.annotations.video_time)
    _advices = db(db.advice.video_id == _video.id).select()
    _suggested_tags = [{'name': 'Voice', 'fields': ['QUESTION','OK', 'WARNING', 'BAD'] } ,
                       { 'name':'Gestual', 'fields': ['QUESTION','OK', 'WARNING', 'BAD']} , 
                       { 'name':'Look', 'fields': ['QUESTION','OK', 'WARNING', 'BAD']} ,
                       { 'name':'Space Use', 'fields': ['QUESTION','OK', 'WARNING', 'BAD']} , 
                       { 'name':'Hesitation', 'fields': ['QUESTION', 'WARNING', 'BAD']}
                      ] #TODO this should come from DB and be more detailed about the fields (OK, Warning, Bad, don't know yet). should be passed as JSON
    #os.system("echo 'annotations =  "+str(_annotations)+"'")
    #check for permissions of individual and group to actually see the video, else show not allowed 
    return dict(
                video = _video,
                #annotations = _annotations,
                advices = _advices,
                #annotation_form = aform
                suggested_tags = _suggested_tags,
                )


#@auth.requires_login() #TODO make user authentication control here!!! .. for the moment a link is needed
def view_vimeo_video():
    """
    Shows the list of uploaded videos
    """
    #if(not auth.user):
    #    redirect(URL('index'))
    _video_id = request.args(0, cast=str)#youtube videoID
    
    _video = db.video(db.video.video_id == _video_id)
    if not _video:
        redirect(URL('video_not_found'))
    #os.system("echo 'video.id =  "+str(_video.id)+"'")
    #_annotations = db(db.annotations.video_id == _video.id).select(orderby=db.annotations.video_time)
    _advices = db(db.advice.video_id == _video.id).select()
    _suggested_tags = [{'name': 'Voice', 'fields': ['QUESTION','OK', 'WARNING', 'BAD'] } ,
                       { 'name':'Gestual', 'fields': ['QUESTION','OK', 'WARNING', 'BAD']} , 
                       { 'name':'Look', 'fields': ['QUESTION','OK', 'WARNING', 'BAD']} ,
                       { 'name':'Space Use', 'fields': ['QUESTION','OK', 'WARNING', 'BAD']} , 
                       { 'name':'Hesitation', 'fields': ['QUESTION', 'WARNING', 'BAD']}
                      ] 
    return dict(
                video = _video,
                #annotations = _annotations,
                advices = _advices,
                #annotation_form = aform
                suggested_tags = _suggested_tags,
                )




#########################################################################
#########################################################################
def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    """
    return dict(form=auth())


def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()


@auth.requires_signature()
def data():
    """
    http://..../[app]/default/data/tables
    http://..../[app]/default/data/create/[table]
    http://..../[app]/default/data/read/[table]/[id]
    http://..../[app]/default/data/update/[table]/[id]
    http://..../[app]/default/data/delete/[table]/[id]
    http://..../[app]/default/data/select/[table]
    http://..../[app]/default/data/search/[table]
    but URLs must be signed, i.e. linked with
      A('table',_href=URL('data/tables',user_signature=True))
    or with the signed load operator
      LOAD('default','data.load',args='tables',ajax=True,user_signature=True)
    """
    return dict(form=crud())
