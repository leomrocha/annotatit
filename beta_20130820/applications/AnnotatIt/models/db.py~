# -*- coding: utf-8 -*-

#########################################################################
## This scaffolding model makes your app work on Google App Engine too
## File is released under public domain and you can use without limitations
#########################################################################

## if SSL/HTTPS is properly configured and you want all HTTP requests to
## be redirected to HTTPS, uncomment the line below:
# request.requires_https()

from datetime import datetime
import uuid
import time
#import urllib2
from gluon.contrib.heroku import get_db                                         
db = get_db() 


APP_NAME = "AnnotatIt"
APP_DOMAIN_NAME = "AnnotatIt.com"
APP_DOMAIN_NAME_2 = "Annotat.It" #TODO register if available
############################################
##Contact email ... this should NEVER be public
##########################################
WEBMASTERS_EMAIL_NAME = "leo"
WEBMASTERS_EMAIL_DOMAIN = "annotatit.com"
WEBMASTERS_EMAIL_DOMAIN_2 = "annotat.it"
WEBMASTERS_EMAIL = "leo@annotatit.com"
WEBMASTERS_EMAIL_2 = "leo@annotat.it"

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

#TODO for later adding a REST administrator possibility
#auth.settings.manager_group_role = 'admin'

## after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)

#for user information
db.define_table('user_info',
    Field('user_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
    #Field('nickname', length=50, default=auth.user.first_name, requires=IS_NOT_EMPTY()),
    Field('nickname', length=50, requires=IS_NOT_EMPTY()),
    Field('image_link',requires=IS_URL()),
    #Field('image', 'upload'),
    #Field('path', 'string', default=URL('download', this.image)), #TODO get the path of the file!!
    )

################
# Media linking
################
#media refers to any type of media either video or audio
db.define_table('media', 
    Field('owner_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
    Field('title', length=256, requires=IS_NOT_EMPTY()),
    #Field('subtitle', length=256, default=""),
    Field('description', length=512, default=""),
    Field('media_annotate_key', length=64, default=lambda: uuid.uuid4(), notnull=True,writable=False, unique=True), 
    Field('media_view_results_key', length=64, default=lambda: uuid.uuid4(), notnull=True,writable=False, unique=True),
    Field('media_embed_key', length=64, default=lambda: uuid.uuid4(), notnull=True,writable=False, unique=True),
    Field('media_id', requires=IS_NOT_EMPTY()),
    Field('media_network', requires=IS_IN_SET(("youtube", "vimeo", "annotatit"))), #maybe facebook will be nice to add, but later!!
    Field('media_url', requires=IS_URL()),
    #media duration thumbnail depends on the media_network to get them, that is why is not mandatory
    Field('media_thumbnail', requires=IS_URL(), default=URL('static', 'images/video_150.png')),
    Field('media_duration', default=-1), 
    #end media network dependent
    Field('privacy', default='public', requires=IS_IN_SET(("unlisted", "public", "private"))), #TODO activate this line
    #Field('privacy', default='public', requires=IS_IN_SET(("unlisted", "public"))), #TODO and erase this one
    Field('annotation_permissions', default='only_me', requires=IS_IN_SET(("only_me", "authorized_groups", "all"))), #TODO activate this line
    #Field('annotation_permissions', default='all', requires=IS_IN_SET(("all", "only_me"))),  
    Field('view_permissions', default='only_me', requires=IS_IN_SET(("only_me", "authorized_groups",  "all"))), #TODO activate this line
    #Field('view_permissions', default='all', requires=IS_IN_SET(("all", "only_me"))),#TODO and erase this one
    Field('creation_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
    Field('update_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
    )
    
##################
####Annotations
##################

#######
#Generic non synchronized nested comments, normal comments system
#######
#a comment that will be time tagged
#db.define_table('comment', 
#    Field('owner_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
#    Field('media_id', 'reference media', requires=IS_NOT_EMPTY()),
#    Field('parent_id', 'reference comment'), #nested comments
#    Field('text', 'text', length=1024, requires=IS_NOT_EMPTY()),
#    Field('creation_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
#    Field('update_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
#    )

########
# Marked Synchronized Comments 
#
# Allows to quickly mark a point in time to later come back and make a more thorough comment
# Marks are shown as icons for easy interpretation
########
#DEPRECATED
db.define_table('flagged_comment', 
    Field('owner_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
    Field('media_id', 'reference media', requires=IS_NOT_EMPTY()),
    Field('parent_id', 'reference comment', default=None), #nested comments
    #Field('media_time', 'time', requires=IS_TIME()), #automatically filled
    Field('media_time', 'double'), #automatically filled
    #Field('mark', requires=IS_IN_SET(("OK", "WARNING", "QUESTION"))),
    Field('keyboard_shortcut', 'string', length=1),
    Field('flag_name','string', length=30),
    Field('flag_color', 'string', length=7 ), # '#RRGGBB'
    Field('text', 'text', length=512, requires=IS_NOT_EMPTY()),
    Field('creation_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
    Field('update_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
    )

## Independent marks, as for giving a possibility to users
# is what before was called TAG, but now I changed the name
#db.define_table('flag', 
#    Field('owner_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
#    Field('media_id', 'reference media', requires=IS_NOT_EMPTY()),
#    Field('name', 'string'), #, requires=IS_IN_SET(("QUESTION", "OK", "WARNING","BAD")) ),
#    Field('media_time', 'time', requires=IS_TIME()), #this field should be automatically generated and filled
#    Field('creation_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
#    Field('update_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
#    )

    
##########
#Tags:
#
# Tags are  words orsmall sentences that refer to a comment, for suggesting
# possible evaluation outcomes
##########

#db.define_table('text_tag', 
#    Field('owner_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
#    Field('parent_id', 'reference comment'), #nested comments
#    Field('text', 'text', length=50, requires=IS_NOT_EMPTY()),
#    Field('creation_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
#    Field('update_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
#    )

#owner of media can suggest what tags to put
#db.define_table('suggested_tag', 
#    Field('owner_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
#    Field('media_id', 'reference media'), #nested comments
#    Field('name', 'text', length=50, requires=IS_NOT_EMPTY()),
#    #Field('icon',  ), #optional
#    Field('creation_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
#    Field('update_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
#    )


######################
# Sections 
# mark media sections
######################
#DEPRECATED
db.define_table('section', 
    Field('owner_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
    Field('media_id', 'reference media', requires=IS_NOT_EMPTY()),
    Field('parent_id', 'reference section', default=None),
    Field('name', 'string' ),
    #Field('text', 'string' ),
    Field('keyboard_shortcut', 'string', length=1),
    Field('flag_name','string', length=30),
    Field('flag_color', 'string', length=7 ), # '#RRGGBB'
    #Field('begin_time', 'time', requires=IS_TIME()), #auto filled
    Field('begin_time', 'double'), #auto filled
    #Field('end_time', 'time', requires=IS_TIME()), #auto filled
    Field('end_time', 'double'), #auto filled
    Field('creation_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
    Field('update_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
    )


######################
# Note 
# a generalized concept of a section AND a flagged_comment
######################
#DEPRECATED
db.define_table('note', 
    Field('owner_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
    Field('media_id', 'reference media', requires=IS_NOT_EMPTY()),
    Field('parent_id', 'reference section', default=None),
    Field('text', 'text', length=512, requires=IS_NOT_EMPTY()),
    Field('keyboard_shortcut', 'string', length=1),
    Field('flag_name','string', length=30),
    Field('flag_color', 'string', length=7 ), # '#RRGGBB'
    #Field('begin_time', 'time', requires=IS_TIME()), #auto filled
    Field('begin_time', 'double'), #auto filled
    #Field('end_time', 'time', requires=IS_TIME()), #auto filled
    Field('end_time', 'double'), #auto filled
    Field('creation_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
    Field('update_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
    )

#TODO create database condition checking 
#TODO check automatic values can not be changed


######################
# Note 
# a generalized concept of a section AND a flagged_comment
######################
#DEPRECATED
db.define_table('script', 
    Field('owner_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
    Field('media_id', 'reference media', requires=IS_NOT_EMPTY()),
    Field('parent_id', 'reference section', default=None),
    Field('text', 'text', requires=IS_NOT_EMPTY()),
    Field('creation_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
    Field('update_datetime', 'datetime',  default=datetime.now(), requires=IS_DATETIME()),
    )

#TODO create database condition checking 
#TODO check automatic values can not be changed


######################################################
#### Groups
#
# Groups in web2py do not include ownership
# AnnotatIt users can create and manage groups
# So ownership of a group must be granted in some way
# Here the hack that does the work
######################################################

db.define_table('group_ownership', 
    Field('owner_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
    Field('group_id', 'reference auth_group', requires=IS_NOT_EMPTY()),
    )


######################################################
#### Contacts
######################################################

#########################################################################
#Invites, modified from a post by massimo di piero in a post here:
# http://www.mail-archive.com/web2py@googlegroups.com/msg78529.html

#db.define_table('invite',
#    Field('inviter_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
#    Field('email', requires=IS_EMAIL() ),
#    Field('uuid',default=str(uuid.uuid4())),
#    Field('accepted', 'boolean', default=False)
#    )
#in case I want something more complicated
#auth.settings.extra_fields['auth_user']=Field('uuid',requires=IS_IN_DB(db,db.invite.uuid)))
#auth.settings.register_onaccept: lambda form: db(db.invite.uuid==form.vars.uuid).delete()
#auth.define_tables()

#db.define_table('contact',
#    Field('source_id', 'reference auth_user', default=auth.user_id, requires=IS_NOT_EMPTY()),
#    Field('target_id', 'reference auth_user', requires=IS_NOT_EMPTY()),
#    )
