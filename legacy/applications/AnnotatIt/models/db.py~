# -*- coding: utf-8 -*-

#########################################################################
## This scaffolding model makes your app work on Google App Engine too
## File is released under public domain and you can use without limitations
#########################################################################

## if SSL/HTTPS is properly configured and you want all HTTP requests to
## be redirected to HTTPS, uncomment the line below:
# request.requires_https()

from datetime import datetime
import time
#import urllib2
from gluon.contrib.heroku import get_db                                         
db = get_db() 


APP_NAME = "AnnotatIt"
APP_DOMAIN_NAME = "AnnotatIt.com"

############################################
##Contact email ... this should NEVER be public
##########################################
WEBMASTERS_EMAIL_NAME = "leo.m.rocha"
WEBMASTERS_EMAIL_DOMAIN = "gmail.com"
WEBMASTERS_EMAIL = "leo.m.rocha@gmail.com"


## by default give a view/generic.extension to all actions from localhost
## none otherwise. a pattern can be 'controller/function.extension'
response.generic_patterns = ['*'] if request.is_local else []
## (optional) optimize handling of static files
# response.optimize_css = 'concat,minify,inline'
# response.optimize_js = 'concat,minify,inline'

from gluon.tools import Auth, Crud, Service, PluginManager, prettydate
auth = Auth(db)
crud, service, plugins = Crud(db), Service(), PluginManager()

## create all tables needed by auth if not custom tables
auth.define_tables(username=False, signature=False)

## configure email
mail = auth.settings.mailer
mail.settings.server = 'logging' or 'smtp.gmail.com:587'
mail.settings.sender = 'you@gmail.com'
mail.settings.login = 'username:password'

## configure auth policy
auth.settings.registration_requires_verification = False
auth.settings.registration_requires_approval = False
auth.settings.reset_password_requires_verification = True

## after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)



db.define_table('video', 
    Field('person_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
    Field('title', length=256,  requires=IS_NOT_EMPTY()),
    Field('subtitle', length=256, default=""),
    Field('video_id', requires=IS_NOT_EMPTY()),
    Field('video_network', requires=IS_IN_SET(("YOUTUBE", "VIMEO"))), #maybe facebook will be nice to add, but later!!
    Field('full_url', requires=IS_URL()),
    Field('privacy', default='unlisted', requires=IS_IN_SET(("unlisted", "public", "private"))), #later add the groups handling, unlisted is public but not shown in any list, public is listed, private is shared to whom you want
    Field('comment_permissions', default='only_me', requires=IS_IN_SET(("only_me", "authorized_groups", "authorized_people", "all"))),
    Field('script', 'text'),
    Field('datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
    )

'''
db.define_table('youtube_videos', 
    Field('person_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
    Field('title', length=256,  requires=IS_NOT_EMPTY()),
    Field('subtitle', length=256, default=""),
    Field('youtube_video_id', requires=IS_NOT_EMPTY()),
    Field('full_url', requires=IS_URL()),
    Field('privacy', default='unlisted', requires=IS_IN_SET(("unlisted", "public","private"))), #later add the groups handling
    Field('comment_permissions', default='only_me', requires=IS_IN_SET(("only_me", "authorized_groups","all"))),
    Field('script', 'text'),
    Field('datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
    )

#TODO should put everything in one table, but for the moment I rather treat them differently
db.define_table('vimeo_videos', 
    Field('person_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
    Field('title', length=256,  requires=IS_NOT_EMPTY()),
    Field('subtitle', length=256, default=""),
    Field('vimeo_video_id', requires=IS_NOT_EMPTY()),
    Field('full_url', requires=IS_URL()),
    Field('privacy', default='unlisted', requires=IS_IN_SET(("unlisted", "public","private"))), #later add the groups handling
    Field('comment_permissions', default='only_me', requires=IS_IN_SET(("only_me", "authorized_groups","all"))),
    Field('script', 'text'),
    Field('datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
    )
''' #TODO this was the old DB before vimeo complete integration

#a comment that will be time tagged
db.define_table('annotations', #TODO change the name to "note" instead of annotations
    Field('video_id', 'reference video', requires=IS_NOT_EMPTY()),#my contact #person I am contacting
    Field('annotator_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
    #Field('annotation_type' , 'string', default= None), #example: hesitation
    #Field('annotation_subtype' , 'string', default=None), #exemple: "ehhh" it is a hesitation, but is more specifically defined
    #Field('evaluation', 'integer', requires=IS_IN_SET((1,2,3,4,5)) ),
    Field('comment',length=512, requires=IS_NOT_EMPTY()),
    Field('video_time', 'time', requires=IS_TIME()), #this field should be automatically generated and filled
    )

#a comment that will be time tagged
db.define_table('advice', 
    Field('video_id', 'reference video', requires=IS_NOT_EMPTY()),#my contact #person I am contacting
    Field('annotator_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
    #Field('annotation_type' , 'string', default= None), #example: hesitation
    #Field('annotation_subtype' , 'string', default=None), #exemple: "ehhh" it is a hesitation, but is more specifically defined
    #Field('evaluation', 'integer', requires=IS_IN_SET((1,2,3,4,5)) ),
    Field('advice_text', 'text', length=512, requires=IS_NOT_EMPTY()),
    )

db.define_table('tag_category', 
    #Field('mother_tag_category', 'reference tag_category'), #might belong to a meta category, for the moment will not implement such complexity
    Field('tag_category_name' , 'string', requires=IS_NOT_EMPTY()), #example: hesitation
    Field('tag_category_description', 'string'),
    )

#a tag type belongs to a tag category, this way tag types can be grouped in categories (toastmasters, music, etc etc etc)
db.define_table('tag_type', 
    #Field('tag_type_id', 'reference tag_category', requires=IS_NOT_EMPTY()),#will belong to a category(e.g. toastmasters)
    Field('tag_type_name' , 'string', requires=IS_NOT_EMPTY()), #example: hesitation
    Field('ok_field', 'boolean', requires=IS_NOT_EMPTY() ),
    Field('warning_field', 'boolean', requires=IS_NOT_EMPTY() ),
    Field('bad_field', 'boolean', requires=IS_NOT_EMPTY() ),
    )

'''
#tag types that will be defined by users
db.define_table('generic_tag_type', 
    #Field('tag_type_id', 'reference tag_category', requires=IS_NOT_EMPTY()),#will belong to a category(e.g. toastmasters)
    Field('tag_type_name' , 'string', requires=IS_NOT_EMPTY()), #example: hesitation
    Field('field', 'list', requires=IS_NOT_EMPTY() ),
    )
'''

#a tag belongs to a tag type, this way tag types can be generated by DB instead of doing that by hand
db.define_table('tag', 
    #Field('tag_type_id', 'reference tag_type', requires=IS_NOT_EMPTY()),#will belong to a tag (e.g. hesitation)
    Field('tag_type_name' , 'string', requires=IS_NOT_EMPTY()), #temporarly this for demo only, the previous line is the good one
    Field('video_id', 'reference video', requires=IS_NOT_EMPTY()),#my contact #person I am contacting
    Field('annotator_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
    Field('evaluation', 'string', requires=IS_IN_SET(("QUESTION", "OK", "WARNING","BAD")) ),
    Field('video_time', 'time', requires=IS_TIME()), #this field should be automatically generated and filled
    )

'''
#tags that belong to user defined tag types (generic_tag_type)
db.define_table('generic_tag', 
    #Field('tag_type_id', 'reference tag_type', requires=IS_NOT_EMPTY()),#will belong to a tag (e.g. hesitation)
    Field('tag_type_name' , 'string', requires=IS_NOT_EMPTY()), #temporarly this for demo only, the previous line is the good one
    Field('video_id', 'reference video', requires=IS_NOT_EMPTY()),#my contact #person I am contacting
    Field('annotator_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
    Field('evaluation', 'string', requires=IS_IN_SET(("QUESTION", "OK", "WARNING","BAD")) ),
    Field('video_time', 'time', requires=IS_TIME()), #this field should be automatically generated and filled
    )
'''


#types of tags that a video can have
db.define_table('possible_tag_categories', 
    Field('video_id', 'reference video', requires=IS_NOT_EMPTY()),
    Field('tag_category_id', 'reference tag_category', requires=IS_NOT_EMPTY()),
    )

#types of tags that a video can have
db.define_table('possible_tags', 
    Field('video_id', 'reference video', requires=IS_NOT_EMPTY()),#my contact #person I am contacting
    Field('tag_type_id', 'reference tag_type', requires=IS_NOT_EMPTY()),
    )

