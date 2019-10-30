import { Panel } from "./panel";
import { TweetData, TwitterUser } from "../twitter";
import * as $ from "jquery";
import { NLPSentimentData, NLPEntityData } from "../nlp";
import { ChartGen } from "../chartgen";
import { createGzip } from "zlib";
import { autoUpdater } from "electron";

export type SummaryData = {
  user: TwitterUser;
  overallSentiment: NLPSentimentData;
  tweets: { tweetData: TweetData; sentimentData: NLPSentimentData }[];
  entityResult: NLPEntityData;
};
export class SummaryPanel extends Panel {
  private data: SummaryData;
  constructor(data: SummaryData) {
    super("100%", "auto");
    this.data = data;
    this.init();
  }

  private init() {
    let avg = this.calculateAvgSentiment(this.data.tweets);
    let nameContainer = $("<div>").css({ "text-align": "center" });
    let imageContainer = $("<div>").css({
      flex: "0 0 50px"
    });
    let sentimentContainer = $("<div>").css({ "text-align": "center" });
    let canvasContainer = $("<div>").css({
      margin: "auto",
      width: "600px",
      "min-height": "600px"
    });
    let img = $("<img>")
      .attr("src", this.data.user.profile_image_url_https)
      .css(this.profilePictureStyle)
      .css("zoom", "50%");
    let name = $("<p>")
      .text(this.data.user.name)
      .css(this.nameStyle)
      .css("font-size", "20px");
    let handle = $("<p>")
      .text("@" + this.data.user.screen_name)
      .css(this.nameStyle)
      .css("color", "gray");
    let overallSentimentText = $("<p>").text(
      "Overall Sentiment: " + this.data.overallSentiment.documentSentiment.score
    );
    let overallMagnitudeText = $("<p>").text(
      "Overall Magnitude: " +
        this.data.overallSentiment.documentSentiment.magnitude
    );
    let averageSentimentText = $("<p>").text("Average Sentiment: " + avg.score);
    let averageMagnitudeText = $("<p>").text(
      "Average Magnitude: " + avg.magnitude
    );
    let ctx = ($("<canvas>")[0] as HTMLCanvasElement).getContext("2d");
    let chart = new ChartGen().genEntityChart(this.data, ctx);

    nameContainer.append(name, handle);
    imageContainer.append(img);
    canvasContainer.append(ctx.canvas);
    sentimentContainer.append(
      overallSentimentText,
      overallMagnitudeText,
      averageSentimentText,
      averageMagnitudeText
    );

    this.getMain().append(nameContainer);
    this.getMain().append(imageContainer);
    this.getMain().append(sentimentContainer);
    this.getMain().append(canvasContainer);
    this.getMain()
      .css("border", "2px solid gray")
      .css("border-radius", "5px");
  }

  private nameStyle = { display: "block", margin: 0 };

  private calculateAvgSentiment(
    data: { tweetData: TweetData; sentimentData: NLPSentimentData }[]
  ) {
    let avg = { score: 0, magnitude: 0 };
    for (let i = 0; i < data.length; i++) {
      avg.score += data[i].sentimentData.documentSentiment.score;
      avg.magnitude += data[i].sentimentData.documentSentiment.magnitude;
    }

    avg.score /= data.length;
    avg.magnitude /= data.length;

    avg.score = +avg.score.toFixed(2);
    avg.magnitude = +avg.magnitude.toFixed(2);

    return avg;
  }
}
