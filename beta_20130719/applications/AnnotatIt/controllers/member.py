from urlparse import urlparse, parse_qs
import json
helpers = local_import('helpers')
from helpers import *
from gluon.validators import *



#########################################################################
##  Settings & profile related pages
#########################################################################

def profile():
    """
    public profile of a user
    """
    return dict()

'''
#########################################################################
##  Group related pages
#########################################################################

@auth.requires_login()
def my_groups():
    """
    """
    return dict()

@auth.requires_login()
def edit_group():
    """
    """
    return dict()

#########################################################################
## Contacts related pages
#########################################################################


@auth.requires_login()
def my_contacts():
    """
    """
    return dict()

@auth.requires_login()
def edit_contact():
    """
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
    """
    return dict()

@auth.requires_login()
def annotate_media():
    """
    Page for  media annotation.
    Needs to be logged in AND have annotation permissions
    """
    return dict()


def view_media():
    """
    Page for viewing annotation results
    """
    return dict()


def embed_media():
    """
    Page for embedding media by an iframe
    """
    return dict()

