# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

#########################################################################
## Customize your APP title, subtitle and menus here
#########################################################################

response.logo = A(B('AnnotatIt'),XML('&trade;&nbsp;'),
                  _class="brand",_href="http://www.annotatit.com/")
                  
response.logo_img = IMG(_src=URL('static','images/annotatit_pencil_200.png'), _alt="AnnotatIt")
response.title = request.application.replace('_',' ').title()
response.subtitle = T('Collaborative Synchronized Media Annotations made Easy')

## read more at http://dev.w3.org/html5/markup/meta.name.html
response.meta.author = 'Leonardo M. Rocha <leo@annotatit.com>'
response.meta.description = 'Synchronized Video Annotation'
response.meta.keywords = 'personal development, leadership, spokesman, video, audio, annotation, social annotation, video annotation, video notes, music notes, media notes, music annotation, music education, online music education, online music video tagging, video analysis, music analysis, media analysis, sound analysis'
response.meta.generator = 'Leonardo M. Rocha'

## your http://google.com/analytics id
response.google_analytics_id = None

#########################################################################
## this is the main application menu add/remove items as required
#########################################################################

response.menu = [
    #(T('Create Account'), False, URL('default', 'register'), [])
]
         
def _auth_user_menu():
    # shortcuts
    #app = request.application
    #ctr = request.controller

    response.menu += [
                        #(T('My videos'), False, URL('my_page')),
                        #(T('Upload'), False, URL('send_card')),
                        #(T('My contacts'), False, URL('my_contacts')),
                        (T('Media'), False, URL('videos'), [
                            (T('My media'), False, URL('my_videos')),
                            (T('Add media'), False, URL('upload_video')),
                        ]),
                        #(T('Audio'), False, URL('audio'), [
                        #    (T('My audio'), False, URL('my_audio')),
                        #    (T('Upload Audio'), False, URL('upload_audio')),
                        #]),
                        #(T('Groups'), False, URL('groups'), [
                        #    (T('My Groups'), False, URL('my_groups')),
                        #    (T('Create Group'), False, URL('create_group')),
                        #    #(T('Manage Group'), False, URL('manage_group')), in case of group owner
                        #]),
                        #(T('Account'), False, URL('edit_account_info'), [
                        #    (T('My Account'), False, URL('my_account')),
                        #    (T('Privacy'), False, URL('my_privacy')),
                        #]),
                        #(T('Send cards by e-mail'), False, URL('default', 'user/login')),
    
                     ]
    
    
def _guest_menu():
    # useful links to internal and external resources
    response.menu += [
                        (T('Register'), False, URL('default', 'user/register')),
                        (T('Login'), False, URL('default', 'user/login'))
                     ]
    #pass
def _admin_menu():
    #TODO in case of administrator user
    pass

if auth.user:
    _auth_user_menu()
else:
    _guest_menu()

