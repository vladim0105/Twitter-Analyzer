import { Panel } from "./panel";
import { TweetData } from "../twitter";
import { NLPSentimentData, NLPEntityData } from "../nlp";
import * as $ from "jquery";
export type TweetSummaryData = {
  tweetData: TweetData;
  sentimentData: NLPSentimentData;
  entityData: NLPEntityData;
};
export class TweetPanel extends Panel {
  private data: TweetSummaryData;
  constructor(data: TweetSummaryData) {
    super("100%", "auto");
    this.data = data;
    this.init();
  }

  private init() {
    console.log(
      ((this.data.tweetData.hasOwnProperty("retweeted_status"))?"[RT]":"") +
      "🐦 Displaying tweet with " +
        this.data.tweetData.retweet_count +
        " retweets: "
    );
    console.log(this.data);
    let profileContainer = $("<div>").css("margin-left", "5%");
    let profileImg = $("<img>")
      .css(this.tweetPictureStyle)
      .attr("src", this.data.tweetData.user.profile_image_url_https);
    let displayName = $("<p>").text(this.data.tweetData.user.name);
    let screenName = $("<p>").text("@"+this.data.tweetData.user.screen_name);
    profileContainer.append(profileImg, displayName, screenName);

    let tweetContainer = $("<div>").css({
      display: "flex",
      "flex-direction": "column",
      "justify-content": "center",
      "align-items": "center",
      width: "100%",
    });

    let textContainer = $("<div>");
    let analysisContainer = $("<div>");
    let text = $("<p>")
      .text('"' + this.data.tweetData.text + '"')
      .css({ "font-style": "italic" });
    
    let sentiStr = "Sentiment: " + super.sentimentString(this.data.sentimentData.documentSentiment.score,
      this.data.sentimentData.documentSentiment.magnitude);
    let dateStr = " - "+ new Date(this.data.tweetData.created_at).getUTCDate();
    let retwStr = " - "+ super.bigNumStr(this.data.tweetData.retweet_count) + "⮤⮧"; //"⮬⮯"
    let tweetStats = $("<p>").text(
      sentiStr + dateStr + retwStr
    );
    /*
    let magnitudeText = $("<p>").text(
      "Overall Magnitude: " +
        this.data.sentimentData.documentSentiment.magnitude
    );
    */

    textContainer.append(text).css({ "text-align": "center" });
    analysisContainer
      .append(tweetStats, /*magnitudeText*/)
      .css({ "text-align": "center" });

    tweetContainer.append(textContainer, analysisContainer);
    this.getMain().append(profileContainer, tweetContainer);
    this.getMain()
      .css("border", "2px solid gray")
      .css("border-radius", "5px")
      .css("flex-direction", "row");
  }
}
