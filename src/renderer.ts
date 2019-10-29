import {
  NaturalLanguageProcessingAPI,
  NLPSentimentData,
  NLPEntityData
} from "./nlp";
import * as $ from "jquery";
import { TwitterAPI, TwitterAccessToken, TweetData } from "./twitter";
import { SummaryPanel } from "./panels/summary_panel";
import { TweetPanel } from "./panels/tweet_panel";
import { ErrorPanel } from "./panels/error_panel";
import { Panel } from "./panels/panel";

let nlp = new NaturalLanguageProcessingAPI();
let twitter = new TwitterAPI();

let twitterAuthToken = "";

//Get the Authorization token from twitter, this is then used as a password for doing API requests.
twitter.getAuthToken(onReceivedAuthToken);
function onReceivedAuthToken(data: TwitterAccessToken) {
  twitterAuthToken = data.access_token;
  //Example usage of twitter api
}

function compileText(data: TweetData[]) {
  let text = data[0].text;
  for (let i = 1; i < data.length; i++) {
    text += data[i].text;
  }
  return text;
}
function onSearch() {
  //Clear the results
  $("#resultContainer").empty();
  //Show loader
  $(".loader").animate({ opacity: 1 }, "slow");

  let handle = $("#username").val() as string;
  let panel: Panel;
  twitter.fetchTweets(twitterAuthToken, handle, (tweets: TweetData[]) => {
    //Convert tweets to any-type in order to check if an error has been returned.
    let error = tweets as any;
    if (error.error) {
      panel = new ErrorPanel("Error test 23456");
      $("#resultContainer").fadeIn("slow");
      panel.appendTo($("#resultContainer"));
      $(".loader").animate({ opacity: 0 }, "slow");
      return;
    }
    //If no error, proceed as normal:
    let text = compileText(tweets);
    nlp.fetchSentimentAnalysis(text, (sentimentAnalysis: NLPSentimentData) => {
      let panel = new SummaryPanel({
        user: tweets[0].user,
        sentimentResult: sentimentAnalysis,
        entityResult: null
      });
      $("#resultContainer").fadeIn("slow");
      panel.appendTo($("#resultContainer"));
      $(".loader").animate({ opacity: 0 }, "slow");
    });
  });
}
//Button click
function hideOverlay() {
  $("#overlay").fadeOut("slow");
  $("#mainResultContainer").fadeIn("slow");
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
  $("#mainResultContainer").fadeOut("fast");
  $("#overlay").fadeIn("slow");
  $("#mainBody").css("display", "none");
  $("#header2").fadeOut("fast");
  $("#form1").fadeOut("fast");
}

function aboutUs() {
  $("#mainBody").css("display", "none");
  $("#aboutUsPage").fadeIn("slow");
}

function setupEvents() {
  $("#entry").on("click", showOverlay);
  $("#overlay").on("click", hideOverlay);
  $("#submit").on("click", onSearch);
  $("#aboutUs").on("click", aboutUs);
  $("#returnToSearchPage").on("click", hideOverlay);
  $("#header2").fadeOut("fast");
  $("#form1").fadeOut("fast");
  $("#mainResultContainer").fadeOut("fast");
  $("#aboutUsPage").fadeOut("fast");
}

$(document).ready(() => {
  setupEvents();
});
