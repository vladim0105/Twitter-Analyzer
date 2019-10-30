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
    let self = this;
    let nameContainer = $("<div>").css({ "text-align": "center" });
    let imageContainer = $("<div>").css({
      flex: "0 0 50px"
    });
    let sentimentContainer = $("<div>").css({ "text-align": "center" });
    let canvasContainer = $("<div>").css({
      margin: "auto",
      width: "50vh",
      "min-height": "50vh"
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
    let sentimentText = $("<p>").text(
      "Overall Sentiment: " + this.data.overallSentiment.documentSentiment.score
    );
    let magnitudeText = $("<p>").text(
      "Overall Magnitude: " +
        this.data.overallSentiment.documentSentiment.magnitude
    );
    let ctx1 = ($("<canvas>")[0] as HTMLCanvasElement).getContext("2d");
    let chartScatter = new ChartGen().genEntityChart(this.data, ctx1);

    //let ctx2 = ($("<canvas>")[0] as HTMLCanvasElement).getContext("2d");
    //let chartEntities = new ChartGen().genEntityChart(this.data, ctx2);

    nameContainer.append(name, handle);
    imageContainer.append(img);
    canvasContainer.append(ctx1.canvas);
    //canvasContainer.append(ctx2.canvas);
    sentimentContainer.append(sentimentText, magnitudeText);

    this.getMain().append(nameContainer);
    this.getMain().append(imageContainer);
    this.getMain().append(sentimentContainer);
    this.getMain().append(canvasContainer);
    this.getMain()
      .css("border", "2px solid gray")
      .css("border-radius", "5px");
  }

  private nameStyle = { display: "block", margin: 0 };
}
