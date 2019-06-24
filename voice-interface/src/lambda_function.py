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

import os
# =========================================================================================================================================
# TODO: The items below this comment need your attention.
# =========================================================================================================================================
EXCEPTION_MESSAGE = "Sorry. I cannot help you with that."

LAUNCH_MESSAGE = "Welcome to showcaser. What can I do for you?"
# =========================================================================================================================================
# TODO: Replace this data with your own.  You can find translations of this data at http://github.com/alexa/skill-sample-python-fact/lambda/data
# =========================================================================================================================================

projects = [
    ["Hacking SSL!", "Cybersecurity", "3", ["hacking", "ssl", "encryption"]],
    ["Dab Mark Zuckerberg!", "Cybersecurity", "2", ["mark"]],
    ["Ligma!", "Cybersecurity", "1", ["hacking"]],
    ["Encryption!", "Cybersecurity", "2", ["encryption"]],
    ["Money?", "Financial Informatics", "2", ["banking", "finance", "money"]],
    ["Moving imagery", "Animation", "2", ["flash", "image"]],
]

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
class LaunchHandler(AbstractRequestHandler):
    """Handler for Skill Launch"""
    def can_handle(self, handler_input):
        return is_request_type('LaunchRequest')(handler_input)
    def handle(self, handler_input):
        handler_input.response_builder.speak(LAUNCH_MESSAGE).set_should_end_session(False)
        return handler_input.response_builder.response
        
class RetrieveProjectsHandler(AbstractRequestHandler):
    """Handler to retrieve Project Type"""
    def can_handle(self, handler_input):
        return is_intent_name("RetrieveProjectsIntent")(handler_input)
    def handle(self, handler_input):
        current_intent = handler_input.request_envelope.request.intent
        slots = current_intent.slots
        hasProject = slots['ProjectType'].value is not None
        if hasProject:
            value = slots['ProjectType'].value
            res = "Here are your projects regarding " + value + ". What else would you like to do?"
            return handler_input.response_builder.speak(res).set_should_end_session(False).ask(" . You can view other projects or query stats").response
        else:
            return handler_input.response_builder.speak(
                                "What type of projects are you looking for").add_directive(
                                ElicitSlotDirective(slot_to_elicit="ProjectType")
                            ).response

class StopHandler(AbstractRequestHandler):
    def can_handle(self, handler_input):
        return is_intent_name("AMAZON.StopIntent")(handler_input) or is_intent_name("AMAZON.CancelIntent")(handler_input)
    def handle(self, handler_input):
        return handler_input.response_builder.speak("Alright. Goodbye!").set_should_end_session(True).response

class HelpIntentHandler(AbstractRequestHandler):
    """Handler for Help Intent."""
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return is_intent_name("AMAZON.HelpIntent")(handler_input)

    def handle(self, handler_input):
        # type: (HandlerInput) -> Response
        logger.info("In HelpIntentHandler")

        handler_input.response_builder.speak("I can help you find projects").ask(
            "Just ask away")
        return handler_input.response_builder.response

class FallbackIntentHandler(AbstractRequestHandler):
    """Handler for Fallback Intent.

    AMAZON.FallbackIntent is only available in en-US locale.
    This handler will not be triggered except in that locale,
    so it is safe to deploy on any locale.
    """
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return is_intent_name("AMAZON.FallbackIntent")(handler_input)

    def handle(self, handler_input):
        # type: (HandlerInput) -> Response
        logger.info("In FallbackIntentHandler")

        handler_input.response_builder.speak("Showcasr can't help you with that").ask(
            "Ask something else!")
        return handler_input.response_builder.response


class SessionEndedRequestHandler(AbstractRequestHandler):
    """Handler for Session End."""
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return is_request_type("SessionEndedRequest")(handler_input)

    def handle(self, handler_input):
        # type: (HandlerInput) -> Response
        logger.info("In SessionEndedRequestHandler")

        logger.info("Session ended reason: {}".format(
            handler_input.request_envelope.request.reason))
        return handler_input.response_builder.response


# Exception Handler
class CatchAllExceptionHandler(AbstractExceptionHandler):
    """Catch all exception handler, log exception and
    respond with custom message.
    """
    def can_handle(self, handler_input, exception):
        # type: (HandlerInput, Exception) -> bool
        return True

    def handle(self, handler_input, exception):
        # type: (HandlerInput, Exception) -> Response
        logger.info("In CatchAllExceptionHandler")
        logger.error(exception, exc_info=True)

        handler_input.response_builder.speak(EXCEPTION_MESSAGE)

        return handler_input.response_builder.response


# Request and Response loggers
class RequestLogger(AbstractRequestInterceptor):
    """Log the alexa requests."""
    def process(self, handler_input):
        # type: (HandlerInput) -> None
        logger.debug("Alexa Request: {}".format(
            handler_input.request_envelope.request))


class ResponseLogger(AbstractResponseInterceptor):
    """Log the alexa responses."""
    def process(self, handler_input, response):
        # type: (HandlerInput, Response) -> None
        logger.debug("Alexa Response: {}".format(response))


# Register intent handlers
sb.add_request_handler(LaunchHandler())
sb.add_request_handler(RetrieveProjectsHandler())
sb.add_request_handler(StopHandler())
sb.add_request_handler(HelpIntentHandler())
sb.add_request_handler(FallbackIntentHandler())
sb.add_request_handler(SessionEndedRequestHandler())

# Register exception handlers
sb.add_exception_handler(CatchAllExceptionHandler())

# TODO: Uncomment the following lines of code for request, response logs.
# sb.add_global_request_interceptor(RequestLogger())
# sb.add_global_response_interceptor(ResponseLogger())

# Handler name that is used on AWS lambda
lambda_handler = sb.lambda_handler()
