from urlparse import urlparse, parse_qs
import json
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
        if auth.has_permission(name='media-view-'+str(media.id), table_name='media', record_id=media.id):
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
    if media and auth.user_id = media.owner_id:
        return True
    return  False
    
def _can_delete_media(media):
    '''
    WARNING!!!! 
    Sadly, validators with parameters can NOT be called from @auth.requires
    Only owner can delete
    '''
    if media and auth.user_id = media.owner_id:
        return True
    return  False


#############################################################################
#  Generic validators for annotations (for the moment are all the same)
#############################################################################

def _can_read_reg(reg):
    try:
        #find associated media,        
        media = db.media(db.media.id == reg.media_id)
        if media:
            if media.view_permissions == "all":
                return True
            #   check user is authenticated
            if not auth.user:
                return False
            #   check current user has the permissions auth_permissions
            if auth.has_permission(name='media-view-'+str(media.id), table_name='media', record_id=media.id):
                return True
    except Exception as err:
        pass

    return False
    
def _can_write_reg(reg):
    try:
        #find associated media,        
        media = db.media(db.media.id == reg.media_id)
        if media:
            #   check user is authenticated
            if not auth.user:
                return False
            if media.view_permissions == "all":
                return True
            #   check current user has the permissions auth_permissions
            if auth.has_permission(name='media-annotate-'+str(media.id), table_name='media', record_id=media.id):
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
    if reg and auth.user_id = reg.owner_id:
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
_can_read_section = _can_read_fscomment = _can_read_reg
_can_write_section = _can_write_fscomment = _can_write_reg
_can_update_section = _can_update_fscomment = _can_update_reg
_can_delete_section = _can_delete_fscomment = _can_delete_reg
    
    
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
    #@auth.requires(_can_read_user,requires_login = False) #Not needed this is public info
    def GET(u_id):
        #returns only a SINGLE user
        usr = db(db.user_info.user_id == u_id).select(
                                    db.user_info.user_id,
                                    db.user_info.nickname,
                                    db.user_info.image
                                    ).first()
        if usr:
            d = usr.as_dict()
            d.update({"image": URL('download', usr.image)})
            return d
        return dict()
    @auth.requires(_can_write_user)
    def POST(*args,**vars):
        #input format should be the one from the models/db.py # flagged_comment
        return db.auth_user.validate_and_insert(**vars)
    @auth.requires(_can_update_user)
    def PUT(u_id,**vars):
        return db.auth_user.validate_and_update(**vars)
        #return db(db.auth_user._id==u_id).update(**vars)
        #return dict()
    @auth.requires(_can_delete_user)
    def DELETE(u_id):
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
    #@auth.requires(_can_read_media, requires_login = False) #deprecated, now has to be called from the inside
    def GET(action, m_key):
        '''
        Returns a SINGLE media record or dict() (empty)
        The single media record has to match:
        action = [annotate|view_results|embed]
        m_id is the key for the action
        '''
        #
        try:
            q = db(db.media["media_"+action+"_key"] == m_key) #TODO replace this line with view/embed/annotate key
            if _can_read_media(q.select().first()):
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
                            db.media.update_datetime
                            ).first()
                return m.as_dict() if m else dict()
            return dict()
        except Exception as err:
            return dict()
        return dict()

    @auth.requires(_can_write_media)
    def POST(*args,**vars):
        #validate data
        #add register and get response id
        ret = db.media.validate_and_insert(**vars)
        if ret.id:
            #create new group for annotate this video user-[ID]_annotate-[mediaID]
            ag_id = auth.add_group("media-annotate-"+str(id), "Annotation permissions for media with id = "+str(ret.id)) 
            #create auth permissions for annotate
            auth.add_permission(ag_id, "media-annotate-"+str(id), 'media', ret.id)
            #add this user as owner of these groups
            db.group_ownership.insert(owner_id=auth.user_id, group_id=ag_id )
            #set user in the group
            auth.add_membership(ag_id, auth.user_id)
            #create new group for view this video user-[ID]_view-[mediaID]
            vg_id = auth.add_group("media-view-"+str(id), "View permissions for media with id = "+str(ret.id)) 
            #create auth permissions for view
            auth.add_permission(vg_id, "media-view-"+str(id), 'media', ret.id)
            #add this user as owner of these groups
            db.group_ownership.insert(owner_id=auth.user_id, group_id=vg_id )
            #set user in the group
            auth.add_membership(vg_id, auth.user_id)
            #TODO if there are invitees, add them to the corresponding group -> for the moment will give another api
            return ret.as_dict() if ret else dict()
        return dict()

    @auth.requires_login()
    def PUT(m_id,**vars):
        #get the record
        cmnt = db.media(db.media.id == m_id)
        #validate
        if cmnt and _can_update_media(cmnt):
            #return db(db.media.id == m_id).update(**vars)
            return db.media.validate_and_update(**vars)
        return dict()
        
    @auth.requires_login()
    def DELETE(m_id):
        cmnt = db.media(db.media.id == m_id)
        #validate
        if cmnt and _can_delete_media(cmnt):
            return db(db.media.id==m_id).delete()
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
    def GET(name, mid):
        #get the record
        cmnt = db.flagged_comment(db.flagged_comment.media_id == mid)
        return cmnt.as_dict() if cmnt else dict()

#/api/fscomment/[:id]
@request.restful()
def fscomment():
    """
        Public and private API is the one from the database
    """
    def GET(c_id):
        #get the record
        cmnt = db.flagged_comment(db.flagged_comment.id == c_id)
        #validate
        if cmnt and _can_read_fscomment(cmnt):
            return cmnt.as_dict() if cmnt else dict()
        return dict()
        
    @auth.requires_login()
    def POST(*args,**vars):
        if _can_write_fscomment(cmnt):
            return db.flagged_comment.validate_and_insert(**vars)
        return dict()
        
    @auth.requires_login()
    def PUT(c_id,**vars):
        #get the record
        cmnt = db.flagged_comment(db.flagged_comment.id == c_id)
        #validate
        if cmnt and _can_update_fscomment(cmnt):
            #return db(db.flagged_comment.id == c_id).update(**vars)
            return db.flagged_comment.validate_and_update(**vars)
        return dict()
        
    @auth.requires_login()
    def DELETE(c_id):
        cmnt = db.flagged_comment(db.flagged_comment.id == c_id)
        #validate
        if cmnt and _can_delete_fscomment(cmnt):
            return db(db.flagged_comment.id==c_id).delete()
        return dict()
        
    return locals()



#/api/sections/media/[:id]
@request.restful()
def sections():
    """
        Get all the sections for a certain media file
        Public and private API is the one from the database
    """
    def GET(name, mid):
        #get the record
        cmnt = db.section(db.section.media_id == mid)
        return cmnt.as_dict() if cmnt else dict()


#/api/section/[:id]
@request.restful()
def section():
    """
        Public and private API is the one from the database
        
    """
    def GET(c_id):
        #get the record
        cmnt = db.section(db.section.id == c_id)
        #validate
        if cmnt and _can_read_fscomment(cmnt):
            return cmnt.as_dict() if cmnt else dict()
        return dict()
        
    @auth.requires_login()
    def POST(*args,**vars):
        if _can_write_fscomment(cmnt):
            return db.section.validate_and_insert(**vars)
        return dict()
        
    @auth.requires_login()
    def PUT(c_id,**vars):
        #get the record
        cmnt = db.section(db.section.id == c_id)
        #validate
        if cmnt and _can_update_fscomment(cmnt):
            return db.section.validate_and_update(**vars)
            #return db(db.section.id == c_id).update(**vars)
        return dict()
        
    @auth.requires_login()
    def DELETE(c_id):
        cmnt = db.section(db.section.id == c_id)
        #validate
        if cmnt and _can_delete_fscomment(cmnt):
            return db(db.section.id==c_id).delete()
        return dict()
        
    return locals()

