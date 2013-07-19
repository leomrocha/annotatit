# -*- coding: utf-8 -*-

#########################################################################
##This file contains the NON logged users as well as
## some error pages
#########################################################################
from urlparse import urlparse, parse_qs
import json
helpers = local_import('helpers')
from helpers import *
from gluon.validators import *


#########################################################################
## Generics pages that user can see when going into the page
#########################################################################

def index():
    """
    """
    print "INDEX = "+str(auth.user)
    if auth.user:
        redirect(redirect(URL('member','profile')))
    return dict()

def terms_and_conditions():
    """
    """
    return dict()

def about():
    """
    """
    return dict()

def contact():
    """
    """
    return dict()

'''
def example():
    """
    """
    return dict()
'''
######################
## Public information
######################

def public_profile():
    """
    public profile of a user
    """
    return dict()
    
def latest_media():
    """
    Latest public media inserted 
    """
    return dict()
    

##########
##Errors
##########

def media_not_found():
    '''
    On media not found
    '''
    return dict()

#def not_allowed():
#    '''
#    Not having permissions to see a file
#    '''
#    return dict()

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
