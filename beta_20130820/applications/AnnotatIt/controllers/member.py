from urlparse import urlparse, parse_qs
import json
helpers = local_import('helpers')
from helpers import *
from gluon.validators import *



#########################################################################
##  Settings & profile related pages
#########################################################################

#@auth.requires_login() # TODO decide if public or only for logged users
def profile():
    """
    public profile of a user, 
    includes the public information (name, and public media)

    """
    return dict()

'''
@auth.requires_login()
def edit_profile():
    """
    A user can change his/her profile options
    A user can decide if he/she has a public profile
    """
    return dict()
'''

'''
#########################################################################
##  Group related pages
#########################################################################

@auth.requires_login()
def my_groups():
    """
        List of the groups the user:
            Belongs To, including the one who Owns
            A link for editing the groups is provided
            An option for creating a group is provided
                Every new group name is restricted to start with
                [user.id]_
                This is done automatically and the user will not
                have an option over this (this is for security issues)
    """
    return dict()

@auth.requires_login()
def edit_group():
    """
        A user can only edit a group he/she owns.
        The edition options are:
        add people
        erase people
        delete group.
        
    """
    return dict()

#########################################################################
## Contacts related pages
#########################################################################


@auth.requires_login()
def my_contacts():
    """
        List the user contact
        The user has the option of adding, editing and erasing contacts
        a contact is only the link to another user, the information available is:
            first name
            last name
            thumbnail
            email
            link to profile
        No further option is available
    """
    return dict()
'''

'''
@auth.requires_login()
def edit_contact():
    """
        WILL NOT BE IMPLEMENTED for the moment
    """
    return dict()
'''
#########################################################################
##Media related pages
#########################################################################


######################
#lists 
######################
@auth.requires_login()
def my_media():
    """
        Lists the media available
        includes the:
         - own media
         - media the user can annotate
         - media the user can view
    """
    return dict()    

'''
@auth.requires_login()
def can_annotate_media():
    """
    """
    return dict()

@auth.requires_login()
def can_view_media():
    """
    """
    return dict()
'''

#################################
#concerning one media file only
#################################
@auth.requires_login()
def add_media():
    """
    Page to add media
    The user is given the option for also adding invitees to view and edit
    
    """
    return dict()

@auth.requires_login()
def edit_media():
    """
    Page to edit media options
    The user can:
        change the media options (privacy, title)
        change the user access options
    """
    return dict()

@auth.requires_login()
def annotate_media():
    """
    Page for  media annotation.
    Needs to be logged in AND have annotation permissions
    """
    _key = request.args(0, cast=str)# media key
    return dict(
            action = "annotate",
            key = _key
    )


def view_media():
    """
    Page for viewing annotation results
    """
    _key = request.args(0, cast=str)# media key
    return dict(
            action = "view",
            key = _key
    )


def embed_media():
    """
    Page for embedding media by an iframe
    """
    _key = request.args(0, cast=str)# media key
    return dict(
            action = "embed",
            key = _key
    )

