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
    $("#entry").on("click", () => {
      this.showOverlay(true);
    });
    $("#overlay").on("click", () => {
      this.showSearch(true);
    });
    $("#submit").on("click", this.onSearch.bind(this));
    $("#aboutUs").on("click", () => {
      this.showAboutUs(true);
    });
    $("#returnToSearchPage").on("click", () => {
      this.showSearch(true);
    });
  }
  private showOverlay(show: boolean) {
    let opacity = show ? 1 : 0;
    let pointer = show ? "auto" : "none";
    $("#overlay")
      .animate({ opacity: opacity }, "slow")
      .css("pointer-events", pointer);
    if (show) {
      this.showSearch(false);
      this.showAboutUs(false);
    }
  }
  private showSearch(show: boolean) {
    let opacity = show ? 1 : 0;
    let pointer = show ? "auto" : "none";
    $("#mainBody")
      .animate({ opacity: opacity }, "slow")
      .css("pointer-events", pointer);
    //$("#header2").css("opacity", opacity);
    //$("#form1").css("opacity", opacity);
    if (show) {
      this.showAboutUs(false);
      this.showOverlay(false);
    }
  }
  private showAboutUs(show: boolean) {
    let opacity = show ? 1 : 0;
    let pointer = show ? "auto" : "none";
    $("#aboutUsPage")
      .animate({ opacity: opacity }, "slow")
      .css("pointer-events", pointer);
    if (show) {
      this.showSearch(false);
      this.showOverlay(false);
    }
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
            this.createTweetPanels(tweets, 5);
            $("#resultContainer").fadeIn("slow");
            panel.appendTo($("#resultContainer"));
            $(".loader").animate({ opacity: 0 }, "slow");
          }
        );
      }
    );
  }
  private createTweetPanels(tweets: TweetData[], numTweets: number) {
    let actualNumTweets = Math.min(tweets.length, numTweets);

    for (let i = 0; i < actualNumTweets; i++) {
      let tweet = tweets[i];
      this.nlp.fetchSentimentAnalysis(tweet.text, (data: NLPSentimentData) => {
        let tweetData: TweetSummaryData = {
          tweetData: tweet,
          sentimentData: data,
          entityData: null
        };
        let panel = new TweetPanel(tweetData);
        panel.appendTo($("#resultContainer"));
      });
    }
  }
}