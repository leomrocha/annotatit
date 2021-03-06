from urlparse import urlparse, parse_qs
import json
#from gluon.contrib.simplejson import loads, dumps
helpers = local_import('helpers')
from helpers import *
from gluon.validators import *

################################################################################
#This file first contains:
#1 - the validators needed for specific row based access
#and other more complex validation interactions
#2 - The REST API itself.
#
################################################################################

################################################################################
###  VALIDATORS
################################################################################

############################################################
#  User Validators
############################################################

def _can_read_user():
    return True
    
def _can_write_user():
    #TODO admin interface, but for the moment, not possible
    return False
    
def _can_update_user():
    #TODO admin interface, but for the moment, not possible
    return False
    
def _can_delete_user():
    #TODO admin interface, but for the moment, not possible
    return False
    

############################################################
#  Media Validators
############################################################

def _can_read_media(media):
    '''
    WARNING!!!! 
    Sadly, validators with parameters can NOT be called from @auth.requires
    '''
    #check media permissions
    if media:
        if media.view_permissions == "all":
            return True
        #   check user is authenticated
        if not auth.user:
            return False
        #   check current user has the permissions auth_permissions
        if auth.user_id == media.owner_id or auth.has_permission(name='media-view', table_name='media', record_id=media.id):
            return True
    return False
    
def _can_write_media():
    #check user is logged (done automagically with the @auth.require() but I 
    #repeat it here in case this function needs to be called from somewhere else
    if auth.user:
        return True
    return False
    
def _can_update_media(media):
    '''
    WARNING!!!! 
    Sadly, validators with parameters can NOT be called from @auth.requires
    Only owner can update
    '''
    if media and auth.user_id == media.owner_id:
        return True
    return  False
    
def _can_delete_media(media):
    '''
    WARNING!!!! 
    Sadly, validators with parameters can NOT be called from @auth.requires
    Only owner can delete
    '''
    if media and auth.user_id == media.owner_id:
        return True
    return  False


#############################################################################
#  Generic validators for annotations (for the moment are all the same)
#############################################################################

def _can_read_reg(reg):
    try:
        #find associated media,        
        media = db.media(db.media.id == reg['media_id'])
        if media:
            if media.view_permissions == "all":
                return True
            #   check user is authenticated
            if not auth.user:
                return False
            #   check current user has the permissions auth_permissions
            if auth.user_id == reg.owner_id or auth.has_permission(name='media-view', table_name='media', record_id=media.id):
                return True
    except Exception as err:
        pass

    return False
    
def _can_write_reg(reg):
    try:
        #find associated media,        
        media = db.media(db.media.id == reg['media_id'])
        if media:
            #   check user is authenticated
            if not auth.user:
                return False
            if media.view_permissions == "all":
                return True
            #   check current user has the permissions auth_permissions
            if auth.user_id == reg.owner_id or auth.has_permission(name='media-annotate', table_name='media', record_id=media.id):
                return True
    except Exception as err:
        pass

    return False
    
def _can_update_reg(reg):
    '''
    WARNING!!!! 
    Sadly, validators with parameters can NOT be called from @auth.requires
    Only owner can delete
    '''
    if reg and auth.user_id == reg.owner_id:
        return True
    return  False
    

#for the moment for update and delete, user MUST be the owner
_can_delete_reg = _can_update_reg

############################################################
#  Annotation specific Validators

#For the moment, all annotations have the same permissions
#here I rename the functions to be able to modify this with ease later in
#case of need
############################################################
_can_read_script = _can_read_note = _can_read_section = _can_read_fscomment = _can_read_reg
_can_write_script = _can_write_note = _can_write_section = _can_write_fscomment = _can_write_reg
_can_update_script = _can_update_note = _can_update_section = _can_update_fscomment = _can_update_reg
_can_delete_script = _can_delete_note = _can_delete_section = _can_delete_fscomment = _can_delete_reg
    
    
################################################################################
##
## RESTful API interfaces
##
################################################################################
#
#Note that all data types have a public(client model or Resource Model) and
# a private (server model, the one stored in the DB) representation
# Only public Resource Model will be presented in the API documentation 
# for each datatype, the private representation can be seen in:
# applications/AnnotatIt/models/db.py
#
################################################################################


#@request.restful()
#def file_path():
#    """
#    As web2py has a path hiding thing for security,
#        here a method to get the path of an image from the generated id
#        This is a public method because files in the 
#        static folder are ment to be public
#    """
#    def GET(fid):
#        p = URL('download',fid)
#        dp = {"file_path": p}
#        return dp if dp else dict()
#    return locals()

#/api/current_user
@request.restful()
def current_user():
    """
    This is ment to give the user his/her id and a way to update the profile
    """
    #@auth.requires(_can_read_user,requires_login = False) #Not needed this is public info
    def GET():
        #returns only a SINGLE user
        usr = db(db.auth_user.id == auth.user_id).select(
                                                    db.auth_user.id,
                                                    db.auth_user.first_name,
                                                    db.auth_user.last_name,
                                                    db.auth_user.email,
                                                    #db.auth_user.thumbnail
                                                   ).first()
        return usr.as_dict() if usr else dict()
    @auth.requires(_can_update_user)
    def PUT(u_id,**vars):
        #TODO
        return db.auth_user.validate_and_update(**vars)
        #resp = db(db.auth_user._id==u_id).update(**vars)
        #return resp
    return locals()


#/api/user/[:id]
@request.restful()
def user():
    """
    Private representation: 
        refer to
                 .../models/db.py#user_info 
                auth_user model (defined by Web2py)
    Public representation:
        The data needed for the end user (to see) is:
            user_id
            nickname
            image (path to the image)
    """
    #print "API user called"
    #print request.vars
    #print "#############"
    #print request.env
    #@auth.requires(_can_read_user,requires_login = False) #Not needed this is public info
    def GET(u_id):
        #print "GET user "+str(u_id)
        #if u_id:
        #print "returning detail in another user"
        #returns only a SINGLE user
        usr = db(db.user_info.user_id == u_id).select(
                                    db.user_info.user_id,
                                    db.user_info.nickname,
                                    db.user_info.image_link
                                    ).first()
        if usr:
            d = usr.as_dict()
            #d.update({"image": URL('download', usr.image)})
            return d
        '''
        else:
            #print "returning current user"
            usr = db(db.auth_user.id == auth.user_id).select(
                                                    db.auth_user.id,
                                                    db.auth_user.first_name,
                                                    db.auth_user.last_name,
                                                    db.auth_user.email,
                                                    #db.auth_user.thumbnail
                                                   ).first()
            return usr.as_dict() if usr else dict()
        '''
        response.status = 204
        return dict()
    #TODO
    @auth.requires(_can_write_user)
    def POST(*args,**vars):
        #TODO
        #input format should be the one from the models/db.py # flagged_comment
        return db.auth_user.validate_and_insert(**vars)
    @auth.requires(_can_update_user)
    def PUT(u_id,**vars):
        #TODO
        return db.auth_user.validate_and_update(**vars)
        #return db(db.auth_user._id==u_id).update(**vars)
        #return dict()
    @auth.requires(_can_delete_user)
    def DELETE(u_id):
        #TODO
        return db(db.auth_user._id==u_id).delete()
        return dict()
    return locals()

#/api/manage_group/:id
#@request.restful()
#def manage_group():
#    """
#    Manage suscription of people to annotate or view a certain media file 
#    GET API:
#        will return { list of people with annotate and list of people with view permissions }
#    Input API:
#        
#    """
#    pass

#/api/current_user
@request.restful()
def media_files():
    """
    This is ment to give the user a list of all the media he/she can access
    """
    #print "getting media files"
    def GET():
        #print "started the get"
        try:
            #TODO separate the data the user receives according to the permissions
            owns = db(db.media.owner_id == auth.user_id or
                         auth.accessible_query("media-annotate", db.media) or
                         auth.accessible_query("media-view", db.media) )
                         
            owns = owns.select(db.media.ALL)
            """
            #print response.json(owns)
            #all the media the user can annotate
            can_annotate = db(auth.accessible_query("media-annotate", db.media)).select(
                                            db.media.id,
                                            db.media.owner_id,
                                            db.media.title,
                                            db.media.media_id,
                                            db.media.media_network,
                                            db.media.media_url,
                                            #db.media.privacy,
                                            db.media.media_annotate_key,
                                            db.media.media_view_results_key,
                                            #db.media.media_embed_key,
                                            #db.media.annotation_permissions,
                                            #db.media.view_permissions,
                                            db.media.creation_datetime,
                                            db.media.update_datetime,
                                            db.media.media_duration,
                                            db.media.media_thumbnail
                                            )
            print "can annotate"
            print can_annotate
            can_view = db(auth.accessible_query("media-view", db.media)).select(
                                            db.media.id,
                                            db.media.owner_id,
                                            db.media.title,
                                            db.media.media_id,
                                            db.media.media_network,
                                            db.media.media_url,
                                            #db.media.privacy,
                                            #db.media.media_annotate_key,
                                            db.media.media_view_results_key,
                                            #db.media.media_embed_key,
                                            #db.media.annotation_permissions,
                                            #db.media.view_permissions,
                                            db.media.creation_datetime,
                                            db.media.update_datetime,
                                            db.media.media_duration,
                                            db.media.media_thumbnail
                                            )
            print "can view"
            print can_view
            """
            if not owns:
                response.status = 204
            ret = response.json(owns) #{}
            return ret 
        except Exception as err:
            response.status = 501
            return dict()
        response.status = 401
        return dict()
    return locals()


#/api/media/[:id]
@request.restful()
def media():
    """
    Private representation: 
        refer to
                 .../models/db.py#user_info 
                auth_user model (defined by Web2py)
    Public representation:
        The data needed for the end user (to see) is:
            db.media.owner_id,
            db.media.title,
            db.media.media_id,
            db.media.media_network,
            db.media.media_url,
            db.media.privacy,
            db.media.annotation_permissions,
            db.media.view_permissions,
            db.media.creation_datetime,
            db.media.update_datetime
        To create, update a new record the last two elements are not needed as they 
        are automatically created
        To delete a record only the ID is needed
            
    """
    #@auth.requires(_can_read_media, requires_login = False) #deprecated, now has to be called from the inside of the method
    def GET(action, m_key):
        '''
        Returns a SINGLE media record or dict() (empty)
        The single media record has to match:
        action = [annotate|view_results|embed]
        m_id is the key for the action
        '''
        #
        #print action
        #print m_key
        try:
            q = db(db.media["media_"+action+"_key"] == m_key)
            #print q
            if _can_read_media(q.select().first()):
                #print "trying thing "
                m = q.select(
                            db.media.id,
                            db.media.owner_id,
                            db.media.title,
                            db.media.media_id,
                            db.media.media_network,
                            db.media.media_url,
                            db.media.privacy,
                            db.media.annotation_permissions,
                            db.media.view_permissions,
                            db.media.creation_datetime,
                            db.media.update_datetime,
                            db.media.media_duration,
                            db.media.media_thumbnail
                            ).first()
                #print m
                return m.as_dict() if m else dict()
            response.status = 401
            return dict()
        except Exception as err:
            response.status = 501
            return dict()
        response.status = 401
        return dict()

    @auth.requires(_can_write_media)
    def POST():
        #validate data
        #add register and get response id
        #process the request for filling media network and permissions and create the new register
        #print "POST, creation of a media file"
        new_media =  json.loads(request.body.read())
        #print "####"
        #print "received data = "+str(new_media)
        #get media network
        media_network = get_service(new_media['media_url'])
        #print media_network
        new_media.update(media_network)
        #print "updated media: "+str(new_media)
        #get privacy options
        invited_annotators = []
        if new_media.has_key('invited_annotators'):
            invited_annotators = new_media['invited_annotators']
            #print invited_annotators
            #TODO make it a list and validate they are all emails
            #eliminate the var from the dict
            del new_media['invited_annotators']
        invited_viewers = []
        if new_media.has_key('invited_viewers'):
            invited_viewers = new_media['invited_viewers']
            #print invited_viewers
            #TODO make it a list and validate they are all emails
            #eliminate the var from the dict
            del new_media['invited_viewers']
        ret = db.media.validate_and_insert(**new_media) #warning, check what is this actually returning
        #print "was register created?? "
        #print ret
        if ret.id:
            #print "setting permissions and groups"
            #create new group for annotate this video user-[ID]_annotate-[mediaID]
            ag_id = auth.add_group("media-annotate-"+str(ret.id), "Annotation permissions for media with id = "+str(ret.id)) 
            #create auth permissions for annotate
            #auth.add_permission(ag_id, "media-annotate-"+str(id), 'media', ret.id)
            auth.add_permission(ag_id, "media-annotate", 'media', ret.id)
            #add this user as owner of these groups
            db.group_ownership.insert(owner_id=auth.user_id, group_id=ag_id )
            #set user in the group
            auth.add_membership(ag_id, auth.user_id)
            #TODO if there are invitees, add them to the corresponding group
            #for e in invited_annotators:
            #   get user (if exists)
            #   iu = db.auth_user(db.auth_user.email == e)
            #   if iu:
            #       auth.add_membership(ag_id, iu.id)
            #   else:
            #       #add to invitees list
            #       #enqueue to send invitation email
            #       pass
            #create new group for view this video user-[ID]_view-[mediaID]
            vg_id = auth.add_group("media-view-"+str(ret.id), "View permissions for media with id = "+str(ret.id)) 
            #create auth permissions for view
            #auth.add_permission(vg_id, "media-view-"+str(id), 'media', ret.id)
            auth.add_permission(vg_id, "media-view", 'media', ret.id)
            #add this user as owner of these groups
            db.group_ownership.insert(owner_id=auth.user_id, group_id=vg_id )
            #set user in the group
            auth.add_membership(vg_id, auth.user_id)
            #TODO if there are invitees, add them to the corresponding group
        if ret:
            return response.json(ret)
        else:
            response.status = 400
            return response.json(ret)
        response.status = 400
        #return dict()

    @auth.requires_login()
    def PUT(m_id):
        #get the record
        umedia = db.media(db.media.id == m_id)
        #to_update =  json.loads(request.body.read())
        #validate
        if umedia and _can_update_media(umedia):
            updated_media =  json.loads(request.body.read())
            #erasing values that should NOT be updated
            #Keys should NEVER be changed
            if updated_media.has_key('media_embed_key'):
                del updated_media['media_embed_key']
            if updated_media.has_key('media_annotate_key'):
                del updated_media['media_annotate_key']
            if updated_media.has_key('media_view_results_key'):
                del updated_media['media_view_results_key']
            #actual url, should NEVER be changed
            if updated_media.has_key('media_url'):
                del updated_media['media_url']
            if updated_media.has_key('media_id'):
                del updated_media['media_id']
            if updated_media.has_key('media_network'):
                del updated_media['media_network']
            try:
                ret =  db(db.media.id == m_id).validate_and_update(**updated_media)
                return response.json(ret)
            except Exception as err:
                print "ERROR"
                print err
        response.status = 401
        return dict()
        
    @auth.requires_login()
    def DELETE(m_id):
        cmnt = db.media(db.media.id == m_id)
        #validate
        if cmnt and _can_delete_media(cmnt):
            return db(db.media.id==m_id).delete()
        response.status = 401
        return dict()
        
    return locals()

################################################################################

#/api/fscomments/media/[:id]
@request.restful()
def fscomments():
    """
        Get all the comments for a certain media file
        Public and private API is the one from the database
    """
    #@auth.requires(_can_read_fscomment, requires_login = False)
    def GET(mid):
        #get the related records 
        #print "getting all comments"
        cmnt = db(db.flagged_comment.media_id == int(mid)).select(db.flagged_comment.ALL)
        #cmnt = db(db.flagged_comment.media_id == int(mid))(db.flagged_comment.owner_id == db.auth_user.id).select(db.flagged_comment.ALL, db.auth_user.id, db.auth_user.first_name)
        #print cmnt
        if cmnt:
            return response.json(cmnt)
        else:
            response.status = 204
            None
    return locals()

#/api/fscomment/[:id]
@request.restful()
def fscomment():
    """
        Public and private API is the one from the database
    """
    #print "fscomment API"
    #print request.env
    def GET(c_id):
        #get the record
        cmnt = db.flagged_comment(db.flagged_comment.id == c_id)
        #validate
        if cmnt and _can_read_fscomment(cmnt):
            return response.json(cmnt) if cmnt else dict()
        response.status = 401
        return dict()
        
    @auth.requires_login()
    def POST():
        #print "posting comment"
        new_comment =  json.loads(request.body.read())
        #print "new comment = "
        #print new_comment
        #print "checking permissions"
        if _can_write_fscomment(new_comment):
            #print "user can write comments"
            try:
                ret = db.flagged_comment.validate_and_insert(**new_comment)            
            except Exception as err:
                print "error!! "
                print err
                ret = err
            #print ret
            return response.json(ret) if ret else dict()
        response.status = 401
        return dict()
        
    @auth.requires_login()
    def PUT(c_id):
        #print "putting comment (update)"
        #print c_id
        #get the record
        cmnt = db.flagged_comment(db.flagged_comment.id == c_id)
        #validate
        #print cmnt
        if cmnt and _can_update_fscomment(cmnt):
            #print "validated"
            #return db(db.flagged_comment.id == c_id).update(**vars)
            updated_comment =  json.loads(request.body.read())
            #print 'getting data from json'
            #print updated_comment
            try:
                ret =  db(db.flagged_comment.id == c_id).validate_and_update(**updated_comment)
                #print ret
                return response.json(ret)
            except Exception as err:
                print "ERROR"
                print err
        response.status = 401
        return dict()
        
    @auth.requires_login()
    def DELETE(c_id):
        #print "enter delete method"
        cmnt = db.flagged_comment(db.flagged_comment.id == c_id)
        #validate
        if cmnt and _can_delete_fscomment(cmnt):
            #print 'has permisions to delete'
            ret =  db(db.flagged_comment.id==c_id).delete()
            #print ret
            return response.json(ret)
        response.status = 401
        return dict()
        
    return locals()


#/api/sections/media/[:id]
@request.restful()
def sections():
    """
        Get all the sections for a certain media file
        Public and private API is the one from the database
    """
    def GET(mid):
        #get the record
        #print "getting all sections"
        sect = db(db.section.media_id == int(mid)).select(db.section.ALL)
        #print sect
        #return response.json(sect) if sect else None
        if sect:
            return response.json(sect)
        else:
            response.status = 204
            None
    return locals()

#/api/section/[:id]
@request.restful()
def section():
    """
        Public and private API is the one from the database
        
    """
    def GET(c_id):
        #get the record
        sect = db.section(db.section.id == c_id)
        #validate
        if sect and _can_read_section(sect):
            return response.json(ret) if sect else dict()
        response.status = 401
        return dict()

    @auth.requires_login()
    def POST():
        print "posting section"
        new_section =  json.loads(request.body.read())
        print "new section = "
        print new_section
        #print "checking permissions"
        if _can_write_section(new_section):
            print "user can write section"
            try:
                ret = db.section.validate_and_insert(**new_section)            
            except Exception as err:
                print "error!! "
                print err
                ret = err
            print ret
            return response.json(ret) if ret else dict()
        response.status = 401
        return dict()
        
        
    @auth.requires_login()
    def PUT(c_id):
        #print "putting sections (update)"
        #print c_id
        #get the record
        sect = db.section(db.section.id == c_id)
        #validate
        #print sect
        if sect and _can_update_section(sect):
            #print "validated"
            updated_section =  json.loads(request.body.read())
            #print 'getting data from json'
            #print updated_section
            try:
                ret =  db(db.section.id == c_id).validate_and_update(**updated_section)
                #print ret
                return response.json(ret)
            except Exception as err:
                print "ERROR"
                print err
        response.status = 401
        return dict()
            
    @auth.requires_login()
    def DELETE(c_id):
        sect = db.section(db.section.id == c_id)
        #validate
        if sect and _can_delete_section(sect):
            ret = db(db.section.id==c_id).delete()
            return response.json(ret)
        response.status = 401
        return dict()
        
    return locals()


#/api/notes/[:id]
@request.restful()
def notes():
    """
        Get all the notes for a certain media file
        Public and private API is the one from the database
    """
    def GET(mid):
        #get the record
        #print "getting all notes"
        sect = db(db.note.media_id == int(mid)).select(db.note.ALL)
        #print sect
        #return response.json(sect) if sect else None
        if sect:
            return response.json(sect)
        else:
            response.status = 204
            None
    return locals()

#/api/note/[:id]
@request.restful()
def note():
    """
        Public and private API is the one from the database
        
    """
    def GET(c_id):
        #get the record
        sect = db.note(db.note.id == c_id)
        #validate
        if sect and _can_read_note(sect):
            return response.json(ret) if sect else dict()
        response.status = 401
        return dict()

    @auth.requires_login()
    def POST():
        #print "posting note"
        new_note =  json.loads(request.body.read())
        #print "new note = "
        #print new_note
        #print "checking permissions"
        if _can_write_note(new_note):
            #print "user can write note"
            try:
                ret = db.note.validate_and_insert(**new_note)            
            except Exception as err:
                print "error!! "
                print err
                ret = err
            #print ret
            return response.json(ret) if ret else dict()
        response.status = 401
        return dict()
        
        
    @auth.requires_login()
    def PUT(c_id):
        #print "putting notes (update)"
        #print c_id
        #get the record
        sect = db.note(db.note.id == c_id)
        #validate
        #print sect
        if sect and _can_update_note(sect):
            #print "validated"
            updated_note =  json.loads(request.body.read())
            #print 'getting data from json'
            #print updated_note
            try:
                #WARNING seems that backbone sets up a field called: "updated" 
                # and as the table has not got it I erase it previous updating
                if updated_note.has_key('updated'):
                    updated = updated_note['updated']
                    del updated_note['updated']
                ret =  db(db.note.id == c_id).validate_and_update(**updated_note)
                #print ret
                return response.json(ret)
            except Exception as err:
                print "ERROR"
                print err
        #print "not allowed to modify record note"
        response.status = 401
        return dict()
            
    @auth.requires_login()
    def DELETE(c_id):
        #print "deletting note"
        sect = db.note(db.note.id == c_id)
        #print "get note"
        #print sect
        #validate
        if sect and _can_delete_note(sect):
            #print "allowed to delete"
            ret = db(db.note.id==c_id).delete()
            #print ret
            return response.json(ret)
        response.status = 401
        return dict()
        
    return locals()
    
    
#/api/media_script/[:media_id]
@request.restful()
def media_script():
    """
        Get all the scripts for a certain media file
        Public and private API is the one from the database
    """
    #@auth.requires(_can_read_fscomment, requires_login = False)
    def GET(mid):
        #get the related records 
        #print "getting all comments"
        data = db(db.script.media_id == int(mid)).select(db.script.ALL).first()
        #cmnt = db(db.flagged_comment.media_id == int(mid))(db.flagged_comment.owner_id == db.auth_user.id).select(db.flagged_comment.ALL, db.auth_user.id, db.auth_user.first_name)
        #print cmnt
        if data:
            return response.json(data)
        else:
            response.status = 204
            None
    return locals()
    
#/api/script/[:id]
@request.restful()
def script():
    """
        Public and private API is the one from the database
        
    """
    def GET(c_id):
        #get the record
        sect = db.script(db.script.id == c_id)
        #validate
        if sect and _can_read_script(sect):
            return response.json(ret) if sect else dict()
        response.status = 401
        return dict()

    @auth.requires_login()
    def POST():
        #print "posting script"
        new_script =  json.loads(request.body.read())
        #print "new script = "
        #print new_script
        #print "checking permissions"
        if _can_write_script(new_script):
            #print "user can write script"
            try:
                ret = db.script.validate_and_insert(**new_script)            
            except Exception as err:
                print "error!! "
                print err
                ret = err
            #print ret
            return response.json(ret) if ret else dict()
        response.status = 401
        return dict()
        
        
    @auth.requires_login()
    def PUT(c_id):
        #print "putting scripts (update)"
        #print c_id
        #get the record
        sect = db.script(db.script.id == c_id)
        #validate
        #print sect
        if sect and _can_update_script(sect):
            #print "validated"
            updated_script =  json.loads(request.body.read())
            #print 'getting data from json'
            #print updated_script
            try:
                ret =  db(db.script.id == c_id).validate_and_update(**updated_script)
                #print ret
                return response.json(ret)
            except Exception as err:
                print "ERROR"
                print err
        response.status = 401
        return dict()
            
    @auth.requires_login()
    def DELETE(c_id):
        sect = db.script(db.script.id == c_id)
        #validate
        if sect and _can_delete_script(sect):
            ret = db(db.script.id==c_id).delete()
            return response.json(ret)
        response.status = 401
        return dict()
        
    return locals()
