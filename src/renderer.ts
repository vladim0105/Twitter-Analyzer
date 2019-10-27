import {
  NaturalLanguageProcessingAPI,
  NLPSentimentData,
  NLPEntityData
} from "./nlp";
import * as $ from "jquery";
import { TwitterAPI, TwitterAccessToken, TweetData } from "./twitter";

let nlp = new NaturalLanguageProcessingAPI();
let twitter = new TwitterAPI();

let twitterAuthToken = "";

//Get the Authorization token from twitter, this is then used as a password for doing API requests.
twitter.getAuthToken(onReceivedAuthToken);
function onReceivedAuthToken(data: TwitterAccessToken) {
  twitterAuthToken = data.access_token;
  //Example usage of twitter api
  twitter.fetchTweets(twitterAuthToken, "realDonaldTrump", twitterExample);
}

function twitterExample(data: TweetData[]) {
  console.log(data[0]);
  console.log("Returned "+data.length+ " tweets");
  //Example usage of NLP api
  nlp.fetchEntityAnalysis(data[0].text, nlpExample);
}

function nlpExample(data: NLPEntityData) {
  console.log(data);
}


function sanityTest(){
  console.log("Button was clicked!");
}
//Button click
function hideOverlay() {
  $("#overlay").fadeOut("slow");
  $("#resultPanel").fadeOut("slow");
  $("#mainBody").css("display", "block");
  setTimeout(function(){ $("#header2").fadeIn("slow"); }, 1000);
  setTimeout(function(){ $("#form1").fadeIn("slow"); }, 2000);
  
}
function showOverlay(){
  $("#overlay").fadeIn("slow");
  $("#mainBody").css("display", "none");
  $("#header2").fadeOut("fast");
  $("#form1").fadeOut("fast");
}

function animatedResult(){
  $("#resultPanel").fadeIn("slow");
}

function setupEvents(){
  $("#entry").on("click", showOverlay);
  $("#overlay").on("click", hideOverlay);
  $("#submit").on("click", animatedResult);
  $("#header2").fadeOut("fast");
  $("#form1").fadeOut("fast");
}
/*
function displayBasicTweetInfo(data: String screen_name){
  console.log()
}
*/

$(document).ready(() => {
  setupEvents();
  
});