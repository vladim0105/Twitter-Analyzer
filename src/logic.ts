import * as $ from "jquery";
import {
  NaturalLanguageProcessingAPI,
  NLPSentimentData,
  NLPEntityData
} from "./nlp";
import { TwitterAPI, TwitterAccessToken, TweetData } from "./twitter";
import { SummaryPanel, SummaryData } from "./panels/summary_panel";
import { TweetPanel, TweetSummaryData } from "./panels/tweet_panel";
import { ErrorPanel } from "./panels/error_panel";
export class Logic {
  private nlp = new NaturalLanguageProcessingAPI();
  private twitter = new TwitterAPI();

  private twitterAuthToken = "";
  constructor() {
    this.twitter.getAuthToken(this.onReceivedAuthToken.bind(this));
    this.setupEvents();
  }
  private setupEvents() {
    this.disableInput(true);

    $("#search_input_field .handle_submit").on(
      "click",
      this.onSearch.bind(this)
    );
    $("#search_input_field .handle_input").keypress(event => {
      if (event.key == "Enter") {
        this.onSearch();
      }
    });
    $("#overlay .handle_submit").on("click", this.overlaySearch.bind(this));
    $("#overlay .handle_input").keypress(event => {
      if (event.key == "Enter") {
        this.overlaySearch();
      }
    });
    $("#compare_input_field .handle_submit").on(
      "click",
      this.onCompare.bind(this)
    );
    $("#compare_input_field .handle_input").keypress(event => {
      if (event.key == "Enter") {
        this.onCompare();
      }
    });
    $("#aboutus").on("click", () => {
      this.showAboutUs(true);
    });
    $("#returnToSearchPage").on("click", () => {
      this.showSearch(true);
    });
    $("#backtotop").on("click", () => {
      $("body").scrollTop(0);
    });
    $("body").scroll(event => {
      let scrollPos = $("body").scrollTop();
      if (scrollPos > 100) {
        $("#backtotop").css({ opacity: 1, "pointer-events": "all" });
      } else {
        $("#backtotop").css({ opacity: 0, "pointer-events": "none" });
      }
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
    $("#header2").animate({ opacity: opacity }, "slow");
    $("#navbar")
      .animate({ opacity: opacity }, "slow")
      .css("pointer-events", pointer);
    $("#back").off("click");
    $("#back").on("click", () => {
      this.showOverlay(true);
    });
    if (show) {
      this.showAboutUs(false);
      this.showOverlay(false);
      let opacity2 = show ? 1 : 0;
      $("#aboutus")
        .animate({ opacity: opacity2 }, "fast")
        .css("pointer-events", pointer);
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
      $("#navbar")
        .animate({ opacity: opacity }, "fast")
        .css("pointer-events", pointer);
      $("#back").off("click");
      $("#back").on("click", () => {
        this.showSearch(true);
      });
      let opacity2 = show ? 0 : 1;
      $("#aboutus")
        .animate({ opacity: opacity2 }, "slow")
        .css("pointer-events", pointer);
    }
  }
  //Get the Authorization token from twitter, this is then used as a password for doing API requests.
  private onReceivedAuthToken(data: TwitterAccessToken) {
    this.twitterAuthToken = data.access_token;
    this.disableInput(false);
  }
  private disableInput(disable: boolean) {
    let opacity = disable ? 0.6 : 1;
    $(".handle_input, .handle_submit")
      .css({ opacity: opacity })
      .prop("disabled", disable);
  }
  private compileText(data: TweetData[]) {
    if (data == null || data.length == 0 || data[0] == null) {
      console.log("[!] Tweets not found");
    }
    let text = data[0].text;
    for (let i = 1; i < data.length; i++) {
      //if (data[i].retweeted == true) continue;
      text += data[i].text;
    }
    return text;
  }

  private onSearch() {
    //Hide Overlay
    this.showOverlay(false);
    this.showSearch(true);
    //Clear the results
    $("#resultContainer").empty();
    //Show loader
    $(".loader").animate({ opacity: 1 }, "slow");

    let handle = $("#search_input_field .handle_input").val() as string;
    this.fetchSummaryData(handle, (data: SummaryData) => {
      this.displayPanels(data);
    });
  }
  private onCompare() {
    //Hide Overlay
    this.showOverlay(false);
    this.showSearch(true);
    //Clear the results
    $("#resultContainer").empty();
    //Show loader
    $(".loader").animate({ opacity: 1 }, "slow");

    let handles = [
      $("#search_input_field .handle_input").val() as string,
      $("#compare_input_field .handle_input").val() as string,
      "elonmusk", "billgates", "barackobama", "cocacola"
    ];
    let summaryDataArr: SummaryData[] = [];
    handles.forEach(handle => {
      this.fetchSummaryData(handle, (data: SummaryData) => {
        summaryDataArr.push(data);
        if (summaryDataArr.length == handles.length) {
          this.displayPanels(...summaryDataArr);
        }
      });
    });
  }
  private overlaySearch() {
    $("#search_input_field .handle_input").val(
      $("#overlay .handle_input").val()
    );
    this.onSearch();
  }
  private createTweetPanels(dataArr: SummaryData[], numTweets: number) {
    let tweetSummaries: TweetSummaryData[] = [];
    dataArr.forEach(value => {
      let actualNumTweets = Math.min(value.tweets.length, numTweets);
      for (let i = 0; i < actualNumTweets; i++) {
        let tweetData: TweetSummaryData = {
          tweetData: value.tweets[i].tweetData,
          sentimentData: value.tweets[i].sentimentData,
          entityData: null
        };

        tweetSummaries.push(tweetData);
      }
    });
    tweetSummaries.sort((a, b) => {
      let aDate = new Date(a.tweetData.created_at);
      let bDate = new Date(b.tweetData.created_at);
      return bDate.getTime() - aDate.getTime();
    });
    tweetSummaries.forEach(value => {
      let panel = new TweetPanel(value);
      panel.appendTo($("#resultContainer"));
    });
  }
  private displayPanels(...data: SummaryData[]) {
    let panel = new SummaryPanel(data);
    panel.appendTo($("#resultContainer"));
    this.createTweetPanels(data, 5);
    $("#resultContainer").fadeIn("slow");
    $(".loader").animate({ opacity: 0 }, "slow");
    $("#compare_input_field").css({ opacity: 1, "pointer-events": "all" });
  }
  private fetchSummaryData(
    handle: string,
    callback: (data: SummaryData) => void
  ) {
    hasShownError = false;
    this.twitter.fetchTweets(
      this.twitterAuthToken,
      handle,
      (tweets: TweetData[]) => {
        //Convert tweets to any-type in order to check if an error has been returned.
        let error = tweets as any;
        if (error.error) {
          displayError(
            "Error fetching tweets from Twitter, this is usually caused by searching for nonexisting Twitter-accounts."
          );
          return;
        }
        //If no error, proceed as normal:
        let text = this.compileText(tweets);
        let summaryData: SummaryData = {
          user: tweets[0].user,
          compiledText: text,
          overallSentiment: null,
          tweets: new Array(tweets.length),
          entityResult: null
        };
        let overallDone = 0;
        this.nlp.fetchSentimentAnalysis(text, (result: NLPSentimentData) => {
          //Error occurs when result is null
          if (result.error) {
            displayError(result.error.message);
            return;
          }
          summaryData.overallSentiment = result;
          overallDone++;
          if (overallDone == 2 && tweetsDone == tweets.length) {
            overallDone = 0;
            tweetsDone = 0;
            callback(summaryData);
          }
        });
        this.nlp.fetchEntityAnalysis(text, (result: NLPEntityData) => {
          if (result.error) {
            displayError(result.error.message);
            return;
          }
          summaryData.entityResult = result;
          overallDone++;
          if (overallDone == 2 && tweetsDone == tweets.length) {
            overallDone = 0;
            tweetsDone = 0;
            callback(summaryData);
          }
        });
        let tweetsDone = 0;

        for (let i = 0; i < tweets.length; i++) {
          let tweet = tweets[i];
          this.nlp.fetchSentimentAnalysis(
            tweet.text,
            (result: NLPSentimentData) => {
              //Error occurs when result is null
              if (result.error) {
                displayError(result.error.message);
                return;
              }
              summaryData.tweets[i] = {
                tweetData: tweet,
                sentimentData: result
              };
              tweetsDone++;
              if (overallDone == 2 && tweetsDone == tweets.length) {
                overallDone = 0;
                tweetsDone = 0;
                callback(summaryData);
              }
            }
          );
        }
      }
    );
  }
}
let hasShownError = false;
export function displayError(msg: string) {
  if (hasShownError) {
    return;
  }
  let errorPanel = new ErrorPanel(msg);
  errorPanel.appendTo($("#resultContainer"));
  $("#resultContainer").fadeIn("slow");
  $(".loader").animate({ opacity: 0 }, "slow");
  hasShownError = true;
}
