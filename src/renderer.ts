import {
  NaturalLanguageProcessingAPI,
  NLPSentimentData,
  NLPEntityData
} from "./nlp";
import * as $ from "jquery";
import { TwitterAPI, TwitterAccessToken, TweetData } from "./twitter";
import { SummaryPanel } from "./panels/summary_panel";
import { TweetPanel } from "./panels/tweet_panel";

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
  console.log("Returned " + data.length + " tweets");
  let sentimentData: NLPSentimentData = {
    documentSentiment: { magnitude: 10, score: 0 },
    language: "en",
    sentences: null
  };
  let panel = new SummaryPanel({
    user: data[0].user,
    sentimentResult: sentimentData,
    entityResult: null
  });
  let tweet = new TweetPanel({
    tweetData: data[0],
    sentimentData: sentimentData,
    entityData: null
  });
  panel.appendTo($("#resultsContainer"));
  tweet.appendTo($("#resultsContainer"));
  //Example usage of NLP api
  nlp.fetchEntityAnalysis(data[0].text, nlpExample);
}

function nlpExample(data: NLPEntityData) {
  console.log(data);
}
//Button click
function hideOverlay() {
  $("#overlay").fadeOut("slow");
  $("#resultPanel").fadeOut("slow");
  $("#mainBody").css("display", "block");
  $("#aboutUsPage").fadeOut("fast");
  setTimeout(function() {
    $("#header2").fadeIn("slow");
  }, 1000);
  setTimeout(function() {
    $("#form1").fadeIn("slow");
  }, 2000);
}
function showOverlay() {
  $("#resultsContainer").fadeOut("fast");
  $("#overlay").fadeIn("slow");
  $("#mainBody").css("display", "none");
  $("#header2").fadeOut("fast");
  $("#form1").fadeOut("fast");
}

function animatedResult() {
  $("#resultsContainer").fadeIn("slow");
}

function aboutUs() {
  $("#mainBody").css("display", "none");
  $("#aboutUsPage").fadeIn("slow");
}

function setupEvents() {
  $("#entry").on("click", showOverlay);
  $("#overlay").on("click", hideOverlay);
  $("#submit").on("click", animatedResult);
  $("#aboutUs").on("click", aboutUs);
  $("#returnToSearchPage").on("click", hideOverlay);
  $("#header2").fadeOut("fast");
  $("#form1").fadeOut("fast");
  $("#resultsContainer").fadeOut("fast");
  $("#aboutUsPage").fadeOut("fast");
}

$(document).ready(() => {
  setupEvents();
});
