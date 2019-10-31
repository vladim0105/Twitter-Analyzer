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
    console.log("🐦 Displaying tweet with "+this.data.tweetData.retweet_count+" retweets");
    console.log("Entities:");
    console.log(this.data.tweetData.entities);
    console.log(this.data.tweetData);
    let textContainer = $("<div>");
    let analysisContainer = $("<div>");
    let text = $("<p>")
      .text('"' + this.data.tweetData.text + '"')
      .css({ "font-style": "italic" });
    let sentimentText = $("<p>").text(
      "Overall Sentiment: " + this.data.sentimentData.documentSentiment.score
    );
    let magnitudeText = $("<p>").text(
      "Overall Magnitude: " +
        this.data.sentimentData.documentSentiment.magnitude
    );

    textContainer.append(text).css({ "text-align": "center" });
    analysisContainer
      .append(sentimentText, magnitudeText)
      .css({ "text-align": "center" });
    this.getMain().append(textContainer, analysisContainer);
    this.getMain()
      .css("border", "2px solid gray")
      .css("border-radius", "5px");
  }
}
