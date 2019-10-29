import * as $ from "jquery";
import {
  NaturalLanguageProcessingAPI,
  NLPSentimentData,
  NLPEntityData
} from "./nlp";
import { TwitterAPI, TwitterAccessToken, TweetData } from "./twitter";
import { SummaryPanel } from "./panels/summary_panel";
import { TweetPanel, TweetSummaryData } from "./panels/tweet_panel";
import { ErrorPanel } from "./panels/error_panel";
import { Panel } from "./panels/panel";
export class Logic {
  private nlp = new NaturalLanguageProcessingAPI();
  private twitter = new TwitterAPI();

  private twitterAuthToken = "";
  constructor() {
    this.twitter.getAuthToken(this.onReceivedAuthToken.bind(this));
    this.setupEvents();
  }
  private setupEvents() {
    $("#entry").on("click", this.showOverlay.bind(this));
    $("#overlay").on("click", this.hideOverlay.bind(this));
    $("#submit").on("click", this.onSearch.bind(this));
    $("#aboutUs").on("click", this.aboutUs.bind(this));
    $("#returnToSearchPage").on("click", this.hideOverlay.bind(this));
    $("#header2").fadeOut("fast");
    $("#form1").fadeOut("fast");
    $("#mainResultContainer").fadeOut("fast");
    $("#aboutUsPage").fadeOut("fast");
  }
  private aboutUs() {
    $("#mainBody").css("display", "none");
    $("#aboutUsPage").fadeIn("slow");
  }

  //Button click
  private hideOverlay() {
    $("#overlay").fadeOut("slow");
    $("#mainResultContainer").fadeIn("slow");
    $("#mainBody").css("display", "block");
    $("#aboutUsPage").fadeOut("fast");
    setTimeout(function() {
      $("#header2").fadeIn("slow");
    }, 1000);
    setTimeout(function() {
      $("#form1").fadeIn("slow");
    }, 1500);
  }
  private showOverlay() {
    $("#mainResultContainer").fadeOut("fast");
    $("#overlay").fadeIn("slow");
    $("#mainBody").css("display", "none");
    $("#header2").fadeOut("fast");
    $("#form1").fadeOut("fast");
  }

  //Get the Authorization token from twitter, this is then used as a password for doing API requests.
  private onReceivedAuthToken(data: TwitterAccessToken) {
    this.twitterAuthToken = data.access_token;
    //Example usage of twitter api
  }

  private compileText(data: TweetData[]) {
    let text = data[0].text;
    for (let i = 1; i < data.length; i++) {
      text += data[i].text;
    }
    return text;
  }
  private onSearch() {
    //Clear the results
    $("#resultContainer").empty();
    //Show loader
    $(".loader").animate({ opacity: 1 }, "slow");

    let handle = $("#username").val() as string;
    let panel: Panel;
    this.twitter.fetchTweets(
      this.twitterAuthToken,
      handle,
      (tweets: TweetData[]) => {
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
        let text = this.compileText(tweets);
        this.nlp.fetchSentimentAnalysis(
          text,
          (sentimentAnalysis: NLPSentimentData) => {
            let panel = new SummaryPanel({
              user: tweets[0].user,
              sentimentResult: sentimentAnalysis,
              entityResult: null
            });
            $("#resultContainer").fadeIn("slow");
            panel.appendTo($("#resultContainer"));
            $(".loader").animate({ opacity: 0 }, "slow");
          }
        );
      }
    );
  }
}
