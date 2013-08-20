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
    This page is the presentation of AnnotatIt to the general public
    Has to motivate the public to join and start using the platform
    """
    #print "INDEX = "+str(auth.user)
    if auth.user: #if the user is logged then go to logged part
        redirect(redirect(URL('member','profile')))
    return dict()

def terms_and_privacy():
    """
    """
    return dict()

def about():
    """

    """
    return dict()

def faq():
    """
    """
    return dict()
 

def contact():
    """
    Contact form that allows the user to contact AnnotatIt
    There is a dropdown option for different options including (but not limited to):
     - sales
     - support
     - billing
     - bug report
     - enhancement  / feature request
     - other 
    """
    form=FORM(
              DIV(LABEL('Your name:'),DIV(
              INPUT(_name='name', requires=IS_NOT_EMPTY()))),
              DIV(LABEL('Your email:'),DIV(
              INPUT(_name='email', requires=IS_EMAIL()))),
              DIV(LABEL('Your website:'),DIV(
              INPUT(_name='website'))),
              DIV(LABEL('Choose a topic:'),DIV(
              SELECT('Feature Request', 'Bug Report', 'Error', 'Billing', 'Contact', 'Company', 'Legal'))),
              DIV(LABEL('Your comments:'),DIV(
              TEXTAREA(_name='comments', requires=IS_NOT_EMPTY()))),            
              INPUT(_type='submit'),
            )
    if form.accepts(request,session):
        response.flash = 'form accepted'
        #TODO make here the email and different actions (maybe put it in a background tasks queue)
    elif form.errors:
        response.flash = 'form has errors'
    else:
        response.flash = 'please fill the form'
    return dict(form=form)
'''
#I don't understand why this login and register fails to actually make something 
#(the form submits OK, but no action is taken later ... )

def login():
    form=auth.login()
    return dict(form=form)

def register():
    form=auth.register()
    return dict(form=form)
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
    This page is a feed that shows a list of 5 - 10 annotated media
    for the visitor to be engaged in getting in
    Idea: this can maybe be added to the index page??
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
# All user authentication
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

#########################################################################
#All things below, do not touch (at all)
#########################################################################

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

'''
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
'''
