import { NLPAPI, NLPData } from "./nlp";
import * as $ from "jquery";
import { TwitterAPI, TwitterAccessToken, TweetData } from "./twitter";

let nlp = new NLPAPI();
let twitter = new TwitterAPI();

let twitterAuthToken = "";
//Get the Authorization token from twitter, this is later used as a password for doing API requests.
twitter.getAuthToken((data: TwitterAccessToken) => {
  twitterAuthToken = data.access_token;
  twitter.fetchTweets(twitterAuthToken, "realDonaldTrump", test2);
});

$(document).ready(function() {
  console.log($("#submit"));
  $("#submit").click(function() {
    nlp.fetch($("#username").val() as String, test);
  });
});

function test(data: NLPData) {
  console.log(
    "Score: " +
      data.documentSentiment.score +
      ", magnitude: " +
      data.documentSentiment.magnitude
  );
}
function test2(data: TweetData[]) {
  console.log(data[0]);
  nlp.fetch(data[0].text, test);
}
