# -*- coding: utf-8 -*-
from urlparse import urlparse, parse_qs
import re
###############################################################################
# CRUD helpers for ajax and web services
###############################################################################
def get_service(link):
    """
    returns a dict: {media_network: "", media_id: "id in the network", media_url: url}
    """
    #os.system("echo 'upload form fields: "+str(uform.vars)+" '")
    #print "get service. link = "+str(link)
    url_data = urlparse(link)
    #print "url data = "+str(url_data)
    #print "data1 = " + str (url_data[1])
    #os.system("echo 'url_data: "+str(url_data)+" '")
    #now check if youtube or vimeo
    if (link.lower().find("youtube") >=0 ):
        query = parse_qs(url_data.query)
        #os.system("echo 'query: "+str(query)+" '")
        video_id = query["v"][0]
        return {"media_network": "youtube", "media_id": video_id, "media_url": link}
    if (link.lower().find("youtu.be") >=0 ):
        vid = url_data.path.split("/")
        video_id =  vid[-1] if len(vid[-1]) > 0 else vid[-2]
        return {"media_network": "youtube", "media_id": video_id, "media_url": link}
    if (link.lower().find("vimeo") >=0 ):
        ##treat like youtube and save data on youtube db Table
        vid = url_data.path.split("/")
        video_id =  vid[-1] if len(vid[-1]) > 0 else vid[-2]
        return {"media_network": "vimeo", "media_id": video_id, "media_url": link}
    return None
    
def get_permissions(args):
    """
    extract permissions settings from a request
    """
    ret = {}
    try:
        ret["view_permissions"] = args.view_permissions
        ret['annotation_permissions'] = args.annotation_permissions
        #if ret["view_permissions"] == "only_me" and ret['annotation_permissions'] == "only_me":
        #    ret["privacy"] = "private"
        if ret["view_permissions"] == "all" and ret['annotation_permissions'] == "all":
            ret["privacy"] = "public"
        else:
            ret["privacy"] = "private" #for the moment, before I can make more changes
        return ret
    except Error as err:
        #print "Error parsing args"
        return None
    return None
    


def parse_permissions(invited, media_id, permission_type):
    """
        Parses the input permissions for emails
        permissions type decides what type (annotation or view) 
        permission is required
    """
    #print "##############"
    #print "creating permissions "
    if not permission_type in ["annotation",'view'] or not media_id:
        #print "ERROR, problem with permission types"
        raise Error("Type ERROR on create_permissions, permission_type is not in ['annotation','view'] but is: "+ permission_type)
    #parse emails
    try:
        #print "starting parsing"
        #print invited
        invited = invited.strip()
        #print type(invited)
        invited = re.split("[,;:\s]" , invited )
        #print "invited = "+str(invited)
        invited = [i.strip() for i in invited if i.strip() != ""]
        #print "invited parsed = "+str(invited)
        return invited
    except Exception as err:
        #print "Error creating permissions = "
        #print err
        #print "-----------------"
        pass
    return True
