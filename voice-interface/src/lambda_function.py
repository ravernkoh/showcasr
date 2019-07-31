# -*- coding: utf-8 -*-
"""Simple fact sample app."""

import random
import logging

from ask_sdk_core.skill_builder import SkillBuilder
from ask_sdk_core.dispatch_components import (
    AbstractRequestHandler, AbstractExceptionHandler,
    AbstractRequestInterceptor, AbstractResponseInterceptor)
from ask_sdk_core.utils import is_request_type, is_intent_name, get_slot_value, get_slot
from ask_sdk_core.handler_input import HandlerInput

from ask_sdk_model.ui import SimpleCard
from ask_sdk_model import Response
from ask_sdk_model.dialog import (
    ElicitSlotDirective, DelegateDirective)
from ask_sdk_model import (
    Response, IntentRequest, DialogState, SlotConfirmationStatus, Slot)
from ask_sdk_model.slu.entityresolution import StatusCode
from ask_sdk_model.intent import Intent
from enum import Enum
import os
import pyrebase
import requests
import random
# =========================================================================================================================================
# TODO: The items below this comment need your attention.
# =========================================================================================================================================
EXCEPTION_MESSAGE = "Sorry. I cannot help you with that."

LAUNCH_MESSAGE = "Welcome to showcaser."
GOODBYE_MESSAGE = "Alright! Goodbye!"
REQUEST_COURSE_MESSAGE = "Which course do you want?"
REQUEST_TAG_MESSAGE = "What type of projects are you looking for?"
HELP_COURSE_MESSAGE = "There is IMGD, IT, FI, ISF, and A3DA."
HELP_TAG_MESSAGE = "There are projects ranging from programming, to design."

# =========================================================================================================================================
# Editing anything below this line might break your skill.
# =========================================================================================================================================

sb = SkillBuilder()
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

config = {
    "apiKey" : os.getenv("apiKey"),
    "projectId" : os.getenv("projectId"),
    "authDomain" : os.getenv("authDomain"),
    "storageBucket": os.getenv("storageBucket"),
    "databaseURL": "",
}

firebase = pyrebase.initialize_app(config)
auth = firebase.auth()

class SessionManager:
    def __init__(self, *args, **kwargs):
        return super().__init__(*args, **kwargs)
    
    def set_session(self, handler_input):
        self.session = get_session(handler_input)
    
    def is_confirming_project_search(self):
        return self.session['expecting']['projectSearch'] is True
    
sessionManager = SessionManager()


class SuggestionType(Enum):
    COURSE = "course"
    TAG = "tag"

    def __repr__(self):
        return self.value
    
    def __eq__(self, other):
        return other == self.value


def GeneratePayload(tag, course):
    payload = {
    "title": "",
	"description": "",
	"tags": [tag],
	"course": [course]
    }
    if tag == "all" or tag is None:
        payload["tags"] = []
    if course == "all" or course is None:
        payload["course"] = []

    return payload
def FormHeader(idToken):
    header = {
        'Authorization' : 'Bearer ' + idToken,
        'Content-Type' : 'application/json'
    }
    return header

def get_expecting_type(handler_input):
    session = get_session(handler_input)
    if session['expecting']['projectSearch'] is True:
        return "PROJECT_SEARCH"

@sb.request_handler(can_handle_func = is_request_type("LaunchRequest"))
def LaunchHandler(handler_input):
    user = auth.sign_in_with_email_and_password(os.getenv("firebase_email"), os.getenv("firebase_password"))
    idToken = user['idToken']
    session = get_session(handler_input)
    session['idToken'] = user['idToken']
    session['isRetrieving'] = False
    session['tag'] = None
    session['course'] = None
    session['fallbackCount'] = 0
    session['expecting'] = {
        'projectSearch' : False,
        'suggestion': False
    }
    session['suggestion'] = {
        'type': "",
        'value': "",
        'count': 0
    }

    return elicit_slot("ProjectType", "RetrieveProjectsIntent", handler_input, REQUEST_TAG_MESSAGE, LAUNCH_MESSAGE)

def get_resolved_value(slot):
    if slot is None:
        return None

    resolution = slot.resolutions.resolutions_per_authority[0]
    code = resolution.status.code
    if code == StatusCode.ER_SUCCESS_NO_MATCH:
        return None
    elif code == StatusCode.ER_SUCCESS_MATCH:
        value = resolution.values[0].value.name
        return value
        logger.info("Value: {}, code: {}".format(value, code))

def get_session(handler_input):
    return handler_input.attributes_manager.session_attributes

def elicit_slot(slot_name, intent_name, handler_input, message_body, suffix):
    return handler_input.response_builder.speak(f"{suffix} {message_body}").add_directive(
                            ElicitSlotDirective(Intent(name=intent_name), slot_to_elicit=slot_name)
                        ).response


@sb.request_handler(can_handle_func = is_intent_name("RetrieveProjectsIntent"))
def GetTypeHandler(handler_input):
    """ Handler for getting Project Type """
    tag = get_slot(handler_input, "ProjectType")
    session = get_session(handler_input)
    logger.info("ProjectType slot: {}".format(tag))

    if tag.value is None:
        return handler_input.response_builder.speak(
                            "Sorry I did not get that. What type of projects do you want?").add_directive(
                            ElicitSlotDirective(slot_to_elicit="ProjectType")
                        ).response
    else:
        session['tag'] = tag.value
        return ProjectHandler(handler_input, "")
        
@sb.request_handler(can_handle_func = is_intent_name("GetCourseIntent"))
def GetCourseHandler(handler_input):
    """ Handler for getting Course """
    course_slot = get_slot(handler_input, "Course")
    session = get_session(handler_input)
    if course_slot.value is None or get_resolved_value(course_slot) is None:
        return handler_input.response_builder.speak(
                            "Sorry, I did not get that. What course do you want?").add_directive(
                            ElicitSlotDirective(slot_to_elicit="Course")
                        ).response
    else:
        value = get_resolved_value(course_slot)
        session['course'] = value
        return ProjectHandler(handler_input, "")
    
@sb.request_handler(can_handle_func = is_intent_name("CourseOnlyIntent"))
def GetCourseOnlyHandler(handler_input):
    return __GetCourseOnlyHandler(handler_input)

def __GetCourseOnlyHandler(handler_input):
    session = get_session(handler_input)
    course = get_resolved_value(get_slot(handler_input, "Course"))
    response = requests.post("https://backend.showcasr.yadunut.com/live", json=GeneratePayload("all", course), headers=FormHeader(session['idToken']))
    message = ""
    if response.status_code == 401:
        message = "Request Error! Unauthorized"
    else:
        session['course'] = None
        json = response.json()
        project_count = json['projectCount']
        if course == "A3DA":
                course = "a. 3. d. a."
        if project_count == 0:
            message = f"Projects from the {course} course was not found"
        else:
            if "all" in course:
                message = f'Here are all projects from all of the courses. There is a total of {project_count} project'
            else:
                message = f'Here are all projects from the {course} course. There is a total of {project_count} project'
            if project_count > 1:
                message += "s"
    message += "."
    message += " Would you like to retrieve other kinds of projects?"
    session['expecting']['projectSearch'] = True
    return handler_input.response_builder.speak(message).set_should_end_session(False).response



def ProjectHandler(handler_input, suffix):
    session = get_session(handler_input)
    tag, course = session['tag'], session['course']
    status = get_course_and_tag_status(handler_input)
    if status == NO_TAG_NO_COURSE:
        return handler_input.response_builder.speak(f"{suffix} So, what kind of projects do you want?").add_directive(
                    ElicitSlotDirective(updated_intent=Intent(name="RetrieveProjectsIntent"),slot_to_elicit="ProjectType")
                ).response
    if status == HAS_TAG_NO_COURSE:
        message = f"{suffix} So, from which course do you want {tag} projects from?"
        return handler_input.response_builder.speak(
                    message).add_directive(
                    ElicitSlotDirective(updated_intent=Intent(name="GetCourseIntent"),slot_to_elicit="Course")
                ).response
    elif status == NO_TAG_HAS_COURSE:
        return __GetCourseOnlyHandler(handler_input)
    elif status == HAS_TAG_HAS_COURSE:
        message = ""
        response = requests.post("https://backend.showcasr.yadunut.com/live", json=GeneratePayload(tag, course), headers=FormHeader(session['idToken']))
        if response.status_code == 401:
            message = "Request Error! Unauthorized"
        else:
            session['tag'] = None
            session['course'] = None
            json = response.json()
            project_count = json['projectCount']
            if course == "A3DA":
                course = "a. 3. d. a."
            if project_count == 0:
                if "all" in course:
                    message = f"{tag} projects from all of the courses were not found"
                else:
                    message = f"{tag} projects from the {course} course was not found"
            else:
                if "all" in course:
                    message = f'Here are {tag} projects from all of the courses. There is a total of {project_count} project'
                else:
                    message = f'Here are {tag} projects from the {course} course. There is a total of {project_count} project'
                if project_count > 1:
                    message += "s"
    message += ". Would you like to retrieve other kinds of projects?"
    session['expecting']['projectSearch'] = True

    return handler_input.response_builder.speak(message).set_should_end_session(False).response

NO_TAG_NO_COURSE = 0
HAS_TAG_HAS_COURSE = 1
NO_TAG_HAS_COURSE = 2
HAS_TAG_NO_COURSE = 3

def get_course_and_tag_status(handler_input):
    session = get_session(handler_input)
    tag, course = session['tag'], session['course']
    if tag is not None and course is None:
        return HAS_TAG_NO_COURSE
    elif tag and course:
        return HAS_TAG_HAS_COURSE
    elif tag is None and course is not None:
        return NO_TAG_HAS_COURSE
    elif tag is None and course is None:
        return NO_TAG_NO_COURSE

@sb.request_handler(can_handle_func = is_intent_name("DisplayCountIntent"))
def GetDisplayCountHandler(handler_input):
    attr = handler_input.attributes_manager.session_attributes
    project_count = attr['projectCount']
    res = f'Total number of projects on display is {project_count}'

    return handler_input.response_builder.speak(res).set_should_end_session(False).response

@sb.request_handler(can_handle_func = lambda x: (is_intent_name("AMAZON.StopIntent")(x) or is_intent_name("AMAZON.CancelIntent")(x)))
def StopHandler(handler_input):
    session = get_session(handler_input)
    status = get_course_and_tag_status(handler_input)
    if session['expecting']['suggestion']:
        session['expecting']['suggestion'] = False
        handler_input.attributes_manager.session_attributes = session
        return handler_input.response_builder.speak("Suggestion cancelled. What kind of projects would you like?").set_should_end_session(False).response
    elif status == NO_TAG_NO_COURSE:
        return handler_input.response_builder.speak(GOODBYE_MESSAGE).set_should_end_session(True).response
    elif status == HAS_TAG_NO_COURSE or status == NO_TAG_HAS_COURSE:
        session['course'] = None
        session['tag'] = None
        return handler_input.response_builder.speak("Retrieving cancelled. What kind of projects would you like?").set_should_end_session(False).response



@sb.request_handler(can_handle_func = is_intent_name("SpecificCourseHelp"))
def CourseHelpHandler(handler_input):
    course_slot = get_slot(handler_input, "Course")
    if course_slot.value is None:
        return ProjectHandler(handler_input, "There is IMGD, IT, FI, ISF, and A3DA.")
    course = get_resolved_value(course_slot)
    message = ""
    if course == "ISF":
        message = "i. s. f. is about cybersecurity. "
    elif course == "FI":
        message = "f. i. is about finance. "
    elif course == "IT":
        message = "i. t. is about programming. "
    elif course == "A3DA":
        message = "a. three. d. a. is about animation. "
    elif course == "IMGD":
        message = "i. m. g. d. is about game design. "
    return ProjectHandler(handler_input, message)


@sb.request_handler(can_handle_func = is_intent_name("AMAZON.HelpIntent"))
def HelpIntentHandler(handler_input):
    return __HelpIntentHandler(handler_input)
    
def __HelpIntentHandler(handler_input):
    """Handler for Help Intent."""
    session = get_session(handler_input)
    tag, course = session['tag'], session['course']
    status = get_course_and_tag_status(handler_input)
    if status == HAS_TAG_NO_COURSE:
        return elicit_slot("Course", "GetCourseIntent", handler_input, REQUEST_COURSE_MESSAGE, "There is IMGD, IT, FI, ISF, and a. 3. d. a. courses.")
    else:
        return elicit_slot("ProjectType", "RetrieveProjectsIntent", handler_input, REQUEST_TAG_MESSAGE, "There are projects ranging from programming to design.")
        

@sb.request_handler(can_handle_func = is_intent_name("ListCoursesIntent"))
def ListCoursesHandler(handler_input):
    return __ListCoursesHandler(handler_input)
    
def __ListCoursesHandler(handler_input):
        return ProjectHandler(handler_input, "There is IMGD, IT, FI, ISF, and A3DA.")

@sb.request_handler(can_handle_func = is_intent_name("ListProjectsIntent"))
def ListProjectsHandler(handler_input):
    return __ListProjectsHandler(handler_input)

def __ListProjectsHandler(handler_input):
        return ProjectHandler(handler_input, "There are projects regarding gaming, programming or even design.")



@sb.request_handler(can_handle_func = is_intent_name("AutoSuggestionIntent"))
def AutoSuggestionHandler(handler_input):
    session = get_session(handler_input)
    suggestionCount = session['suggestion']['count']
    if suggestionCount == 0:
        return __GetSuggestionHandler(handler_input)
    elif suggestionCount >= 1:
        return __GetSuggestionHandler(handler_input, auto_choose=True)


@sb.request_handler(can_handle_func = is_intent_name("GetSuggestionIntent"))
def GetSuggestionHandler(handler_input):
    return __GetSuggestionHandler(handler_input)

def __GetSuggestionHandler(handler_input, auto_choose=False, suffix=""):
    session = get_session(handler_input)
    status = get_course_and_tag_status(handler_input)
    courses = ["ISF", "IMGD", "FI", "IT"]
    tags = ["programming", "gaming", "design"]
    chosen_course = random.choice(courses)
    chosen_tag = random.choice(tags)
    session['expecting']['suggestion'] = True

    session['suggestion']['count'] += 1
    if status == HAS_TAG_NO_COURSE:
        message = f"{suffix} Would you like to search for {session['tag']} projects from the {chosen_course} course?"
        if auto_choose:
            session['course'] = session['suggestion']['value']
            session['suggestion']['count'] = 0
            session['suggestion']['type'] = ''
            session['suggestion']['value'] = ''
            return ProjectHandler(handler_input, f"Okay, I chose the {chosen_course} course for you.")
        session['suggestion']['type'] = SuggestionType.COURSE.value
        session['suggestion']['value'] = f"{chosen_course}"
        return handler_input.response_builder.speak(message).set_should_end_session(False).response
    elif status == NO_TAG_NO_COURSE:
        message = f"{suffix} Would you like to search for {chosen_tag} projects"
        if auto_choose:
            session['tag'] = session['suggestion']['value']
            session['suggestion']['count'] = 0
            session['suggestion']['type'] = ''
            session['suggestion']['value'] = ''
            return ProjectHandler(handler_input, f"Okay, I chose {chosen_tag} projects for you.")
        session['suggestion']['type'] = SuggestionType.TAG.value
        session['suggestion']['value'] = f"{chosen_tag}"
        return handler_input.response_builder.speak(message).set_should_end_session(False).response

@sb.request_handler(can_handle_func = is_intent_name("AMAZON.FallbackIntent"))
def FallbackIntentHandler(handler_input):
    session = get_session(handler_input)
    fallbackCount = session['fallbackCount']
    if fallbackCount == 1:
        status = get_course_and_tag_status(handler_input)
        if status == HAS_TAG_NO_COURSE:
            return __ListCoursesHandler(handler_input)
        else:
            return __ListProjectsHandler(handler_input)
    elif fallbackCount == 2:
        return __GetSuggestionHandler(handler_input, suffix="I can't do that for you. However I can help suggest.")
    elif fallbackCount >= 3:
        return handler_input.response_builder.speak("This is out of my domain. Goodbye").response
    return __FallbackIntentHandler(handler_input, "I did not get that.")

def __FallbackIntentHandler(handler_input, suffix):
    """Handler for Fallback Intent.
    AMAZON.FallbackIntent is only available in en-US locale.
    This handler will not be triggered except in that locale,
    so it is safe to deploy on any locale.
    """
    session = get_session(handler_input)
    status = get_course_and_tag_status(handler_input)
    fallbackCount = session['fallbackCount']

    session['fallbackCount'] += 1
    handler_input.attributes_manager.session_attributes = session
    if status == HAS_TAG_NO_COURSE:
        return elicit_slot("Course", "GetCourseIntent", handler_input, REQUEST_COURSE_MESSAGE, suffix)
    else:
        return handler_input.response_builder.speak(f"{suffix} What kind of projects would you like?").add_directive(
            ElicitSlotDirective(updated_intent=Intent(name="RetrieveProjectsIntent"),slot_to_elicit="ProjectType")
        ).response

@sb.request_handler(can_handle_func = is_intent_name("AMAZON.YesIntent"))
def YesHandler(handler_input):
    session = get_session(handler_input)
    if session['expecting']['projectSearch']:
        session['expecting']['projectSearch'] = False
        handler_input.attributes_manager.session_attributes = session
        return ProjectHandler(handler_input, "")
    elif session['expecting']['suggestion']:
        session['expecting']['suggestion'] = False
        if session['suggestion']['type'] == SuggestionType.COURSE.value:
            session['course'] = session['suggestion']['value']
        elif session['suggestion']['type'] == SuggestionType.TAG.value:
            session['tag'] = session['suggestion']['value']
        session['suggestion']['count'] = 0
        session['suggestion']['type'] = ''
        session['suggestion']['value'] = ''
        handler_input.attributes_manager.session_attributes = session
        return ProjectHandler(handler_input, "")
    else:
        return __FallbackIntentHandler(handler_input, "I did not ask a yes or no question. Anyway, ")
 
@sb.request_handler(can_handle_func = is_intent_name("AMAZON.NoIntent"))
def NoHandler(handler_input):
    session = get_session(handler_input)
    if session['expecting']['projectSearch']:
        session['expecting']['projectSearch'] = False
        return handler_input.response_builder.speak("Okay, call me again if you need me. Goodbye.").response
    elif session['expecting']['suggestion']:
        session['expecting']['suggestion'] = False
        if session['suggestion']['count'] >= 2:
            return handler_input.response_builder.speak("Okay, call me again if you need me. Goodbye.").response
        else:
            return __GetSuggestionHandler(handler_input)
    else:
        return __FallbackIntentHandler(handler_input, "I did not ask a yes or no question. Anyway, ")

@sb.request_handler(can_handle_func = is_request_type("SessionEndedRequest"))
def SessionEndedRequestHandler(handler_input):
    """Handler for Session End."""
    # type: (HandlerInput) -> Response
    logger.info("In SessionEndedRequestHandler")

    logger.info("Session ended reason: {}".format(
        handler_input.request_envelope.request.reason))
    return handler_input.response_builder.response


# Exception Handler
@sb.exception_handler(can_handle_func = lambda i, e: True)
def CatchAllExceptionHandler(handler_input, exception):
    """Catch all exception handler, log exception and
    respond with custom message.
    """
    # type: (HandlerInput, Exception) -> Response
    logger.info("In CatchAllExceptionHandler")
    logger.error(exception, exc_info=True)

    handler_input.response_builder.speak(EXCEPTION_MESSAGE)

    return handler_input.response_builder.speak(f"{exception}").response

@sb.global_response_interceptor()
def ResponseLogger(handler_input, response):
    """Log the alexa responses."""
    logger.debug("Alexa Response: {}".format(response))

@sb.global_request_interceptor()
def request_interceptor(handler_input):
    if is_request_type("IntentRequest")(handler_input):
        sessionManager.set_session(handler_input)
        session = get_session(handler_input)
        if not (is_intent_name("AMAZON.YesIntent")(handler_input) or is_intent_name("AMAZON.NoIntent")(handler_input) or is_intent_name("AMAZON.StopIntent")(handler_input) or is_intent_name("AMAZON.CancelIntent")(handler_input)):
            if session['expecting']['projectSearch']:
                session['expecting']['projectSearch'] = False
            if session['expecting']['suggestion']:
                session['expecting']['suggestion'] = False
        if not (is_intent_name("AMAZON.YesIntent")(handler_input) or is_intent_name("GetSuggestionIntent")(handler_input) or is_intent_name("AutoSuggestionIntent")(handler_input)):
            session['suggestion']['count'] = 0
            session['suggestion']['type'] = ''
            session['suggestion']['value'] = ''
    logger.info("Request received: {}".format(handler_input.request_envelope.request))

# Handler name that is used on AWS lambda
lambda_handler = sb.lambda_handler()
# sb.add_request_handler(ConfirmSuggestionHandler())