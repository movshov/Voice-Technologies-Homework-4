/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const SKILL_NAME = 'Bar Cookies';
const HELP_MESSAGE = 'You can say Give me the ingredients for this recipe, Give me the recipe steps, or you can exit...';
const HELP_PROMT = 'What can I help you with?';
const STOP_MESSAGE = 'Thanks for stopping by. Have a good day';
var RECIPE_STEP = 0; //keep track of which step in the recipe the user is currently at. 
const MORE_MESSAGE = 'What would you like to do next?'
const PAUSE = '<break time="0.4s" />'
const WHISPER = '<amazon:effect name="whispered" />'


const recipeingredients = [
    'butter',
    'white sugar',
    'brown sugar',
    'eggs',
    'vanilla extract',
    'baking soda', 
    'hot water',
    'baking soda',
    'all purpose flour',
    'semisweet chocolate chips',
    'nuts'
    ]
    
const quantity = [
    '1 cup ',
    '1 cup ',
    '1 cup ',
    '2 ',
    '2 teaspoon ',
    '1 teaspoon ', 
    '2 teaspoon ',
    '1/2 teaspoon ',
    '3 cups ',
    '2 cups ',
    '1 cup '
    ]
    
const instructions = [
    'Preheat oven to 350 degrees F (175 degrees C)', 
    'Combine the butter, white sugar, and brown sugar until smooth.',
    'Then beat in the eggs one at a time, then stir in the vanilla extract.', 
    'Next, dissolve the baking soda in hot water then add it to the batter along with the salt. ',
    'Stir in the flour, chocolate chips, and walnuts or any other type of nut you prefer. ',
    'Then place large tablespoons fulls of the batter onto an ungreased oven pan.',
    'Bake for 10 minutes in the oven or until the edges are nicely browned.',
    'Dig in!'
    ]

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome, to Bars Cookies Recipe!';
        //const repromptText = 'What would you like to do?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(MORE_MESSAGE)
            .getResponse();
    }
};

const CaptureRecipeInfoHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetRecipeInfo';   //call intent.
    },

    handle(handlerInput) {
        let userrecipe = handlerInput.requestEnvelope.request.intent.slots.recipe.value;
        let useringredient = handlerInput.requestEnvelope.request.intent.slots.ingredients.value;
        let usercheck = handlerInput.requestEnvelope.request.intent.slots.check.value;

        let speakOutput = '';
        
        if(usercheck){ // check to see if user wants to check for an ingredient in the recipe
            if(usercheck === 'can I substitute'){   //check if user is trying to alter recipe ingredients. 
                speakOutput = 'Sadly, we dont recommend altering from the original recipe.'  //deny altering ingredients. 
            }else if(usercheck === 'can you make'){
                speakOutput = 'Sadly, we dont recommend altering from the original recipe.'  //deny altering ingredients. 
            }else if(usercheck === 'can you use'){
                speakOutput = 'Sadly, we dont recommend altering from the original recipe.'  //deny altering ingredients. 
            }else if(usercheck === 'can I use'){
                speakOutput = 'Sadly, we dont recommend altering from the original recipe.'  //deny altering ingredients.
            }else{   // call check recipe for "is there,"
               speakOutput = checkRecipe(useringredient);   
               //speakOutput = `Recipe is ${userrecipe}, check is ${usercheck}, ingredient is ${useringredient}`; //reset speakOutput;
            }
            
        }
        else{   //otherwise display recipe ingredients and quantities or check for ingredients. 
             if(useringredient === "ingredients" || !useringredient){ //list all ingredients in the recipe. Give me the recipe. Tell me the recipe. What is the recipe will all work. 
                 speakOutput = getRecipe();
             }else{     //check recipe for a certain ingredient.
                 speakOutput = checkRecipe(useringredient);
             }
             //speakOutput = `Recipe is ${userrecipe} ingredient is ${useringredient}`; //reset speakOutput;
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt()
            .getResponse();
    }  
};

const CaptureRecipeStepsHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetRecipeSteps';
    },
    handle(handlerInput) {
        let userrecipesteps = handlerInput.requestEnvelope.request.intent.slots.recipeStep.value;   //grab recipestp slot. 
        let userinstruction = handlerInput.requestEnvelope.request.intent.slots.instruction.value;  //grab instruction slot. 
        let usertool = handlerInput.requestEnvelope.request.intent.slots.tool.value;                //grab tool slot. 
        let speakOutput = ''; //set speakOutput to empty by default. 

        //speakOutput = `instruction is ${userinstruction} userrecipesteps is ${userrecipesteps}`; //FOR TESTING INPUT;
        if(userinstruction){
            speakOutput = instructionSort(userinstruction);
        }
        if(usertool){
            speakOutput = toolChecK(usertool, userinstruction);
        }
        else if(!usertool && !userinstruction && userrecipesteps){  //user wants all recipe steps. EX: What are the recipe steps?, Give me the recipe steps., 
            for(var i=0; i <instructions.length; i++){
                speakOutput += instructions[i] + PAUSE;  //grab all instructions. 
            }
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say stuff like, "What ingredients do I need for this recipe"' + PAUSE + '"Can I substitute almond milk in this recipe?"' + PAUSE + '"Does this recipe contain any eggs?"' + MORE_MESSAGE;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

function getRecipe(){   //display all ingredients in the recipe with quantities. 
    var Response = '';
    for (var i=0; i<recipeingredients.length; i++){
        Response += quantity[i] + recipeingredients[i] + '.' + PAUSE;
    }
    return Response;
}

function checkRecipe(checkforingredient){   //check ingredients array for user checkforingredient. 
    
    for(var i=0; i < recipeingredients.length; i++){
        if (checkforingredient === recipeingredients[i]){ //if the ingredient was found. 
            const output = WHISPER + `YES! There is ${checkforingredient} in this recipe. ` + PAUSE;
            //const more = MORE_MESSAGE;
            return output;
        }
    }
    // if the ingredient was not found. 
    const output = WHISPER + 'No, that ingredient is not in this recipe.' + PAUSE + MORE_MESSAGE;
    //const more = MORE_MESSAGE;
    return output;
    //return {speach: output, reprompt:more};
}

function instructionSort(userinstruction){  //check what instruction the user gave and call the correct function. 
    var output = '';
    if(userinstruction === 'continue' || userinstruction === 'skip' || userinstruction === 'next'){ //display next recipe instruction. 
        if(RECIPE_STEP < instructions.length){  //check to make sure there are more steps. 
            RECIPE_STEP++;
            output = instructions[RECIPE_STEP]; //grab the next instruction.
            if (RECIPE_STEP === instructions.length-1){  //we have reached the end of our recipe steps. 
                output += 'You have reached the end of this recipe. To start the recipe again say "Start recipe steps over again or Start recipe steps". ' + PAUSE;
            }
        }
        return output;
    }else if(userinstruction === 'repeat' || userinstruction === 'redo' || userinstruction ==='again'){ //user wants to repeat last instruction.
        output = instructions[RECIPE_STEP] + PAUSE; //grab last instruction. 
        return output;
    }else if(userinstruction === 'over' || userinstruction === 'start'){   //user wants to start at the beginning.
        RECIPE_STEP = 0;
        output = instructions[RECIPE_STEP] + PAUSE; //grab first instruction. 
        return output;
    }else if(userinstruction === 'optional'){   //user wants to know if a step is optional. (NO). 
        output = "NO. Each step is necessary to create this recipe. " + PAUSE + MORE_MESSAGE;
        return output;
    }else if(userinstruction === 'how many'){   //user wants to know how many steps in this recipe. 
        output = "This recipe has only 8 instructions to make it. " + PAUSE + MORE_MESSAGE;
        return output;
    }else if(userinstruction === 'all'){    //user wants to hear all recipe instructions. 
        for(var i=0; i <instructions.length; i++){
            output += instructions[i] + PAUSE;  //grab all instructions. 
        }
        return output;
    }
}

function toolChecK(usertool, userinstruction){   //check which tool the user wants to verify that they need. 
    var output = '';
    if(userinstruction === 'without'){
        if(usertool === 'oven'){
            output = 'NO. You have to have an oven for this recipe. ' + PAUSE + MORE_MESSAGE;
            return output;
        }else if(usertool === 'stand miker' || usertool === 'hand mixer'){
            output = 'Yes. You will be able to cook this recipe without that tool.' + PAUSE + MORE_MESSAGE;
            return output;
        }
    }
}
/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CaptureRecipeInfoHandler,
        CaptureRecipeStepsHandler, 
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) //make sure IntentReflectorHandler is the last handler in the list so we don't override custom handlers. 
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();