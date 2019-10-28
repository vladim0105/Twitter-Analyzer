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
  $("#overlay").css("display", "none");
  $("#mainBody").css("display", "block");
}
function showOverlay() {
  $("#overlay").css("display", "block");
  $("#mainBody").css("display", "none");
}

function setupEvents() {
  $("#entry").on("click", showOverlay);
  $("#overlay").on("click", hideOverlay);
}

$(document).ready(() => {
  setupEvents();
});
