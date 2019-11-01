import { Panel } from "./panel";
import { TweetData, TwitterUser } from "../twitter";
import * as $ from "jquery";
import { NLPSentimentData, NLPEntityData } from "../nlp";
import { ChartGen } from "../chart_generator";

export type SummaryData = {
  user: TwitterUser;
  compiledText: string;
  overallSentiment: NLPSentimentData;
  tweets: { tweetData: TweetData; sentimentData: NLPSentimentData }[];
  entityResult: NLPEntityData;
};
export class SummaryPanel extends Panel {
  private data: SummaryData[];
  constructor(data: SummaryData[]) {
    super("100%", "auto");
    this.data = data;
    console.log(data);
    this.init();
  }

  private init() {
    this.getMain().append(this.createProfiles());
    this.getMain().append(this.createTimeCharts());
    this.getMain().append(this.createEntityCharts());
    this.getMain().append(this.createScatterChart());
    //this.getMain().append(this.createTweetDevCharts());
    this.getMain().append(this.genHashtagChart());
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
  private createProfiles() {
    let profilesContainer = $("<div>").css({
      display: "flex",
      "flex-direction": "row",
      width: "100%"
    });
    this.data.forEach(value => {
      let profileContainer = $("<div>").css({ "flex-grow": 1 });
      let avg = this.calculateAvgSentiment(value.tweets);
      let nameContainer = $("<div>").css({ "text-align": "center" });
      let imageContainer = $("<div>").css({
        flex: "0 0 50px"
      });
      let sentimentContainer = $("<div>").css({ "text-align": "center" });

      let img = $("<img>")
        .attr("src", value.user.profile_image_url_https)
        .css(this.profilePictureStyle)
        .css("zoom", "50%");
      let name = $("<p>")
        .text(value.user.name)
        .css(this.nameStyle)
        .css("font-size", "20px");
      let handle = $("<p>")
        .text("@" + value.user.screen_name)
        .css(this.nameStyle)
        .css("color", "gray");
      let bio = $("<p>")
        .text(value.user.description)
        .css(this.nameStyle)
        .css("color", "gray");
      let overallSentimentText = $("<p>").text(
        "Overall Sentiment: " + value.overallSentiment.documentSentiment.score
      );
      let overallMagnitudeText = $("<p>").text(
        "Overall Magnitude: " +
          value.overallSentiment.documentSentiment.magnitude
      );
      let averageSentimentText = $("<p>").text(
        "Average Sentiment: " + avg.score
      );
      let averageMagnitudeText = $("<p>").text(
        "Average Magnitude: " + avg.magnitude
      );

      nameContainer.append(name, handle, bio);
      imageContainer.append(img);

      sentimentContainer.append(
        overallSentimentText,
        overallMagnitudeText,
        averageSentimentText,
        averageMagnitudeText
      );
      profileContainer.append(
        nameContainer,
        imageContainer,
        sentimentContainer
      );
      profilesContainer.append(profileContainer);
    });
    return profilesContainer;
  }
  private createTimeCharts() {
    let tweetTimeContainer = $("<div>").css(doubleChartParent);
    let tweetHourContainer = $("<div>").css(doubleChartChild);
    let bubbleContainer = $("<div>").css(doubleChartChild);
    let tweetHourCanvas = $("<canvas>")[0] as HTMLCanvasElement;
    let tweetHourChart = new ChartGen().genHourLine(
      tweetHourCanvas.getContext("2d"),
      ...this.data
    );
    tweetHourContainer.append(tweetHourCanvas);

    let bubbleCanvas = $("<canvas>")[0] as HTMLCanvasElement;
    let bubbleChart = new ChartGen().genDayLine(
      bubbleCanvas.getContext("2d"),
      ...this.data
    );
    bubbleContainer.append(bubbleCanvas);
    tweetTimeContainer.append(tweetHourContainer, bubbleContainer);

    return tweetTimeContainer;
  }
  private createEntityCharts() {
    let entityChartContainer = $("<div>").css(doubleChartParent);
    let pieContainer = $("<div>").css(doubleChartChild);
    let bubbleContainer = $("<div>").css(doubleChartChild);
    let pieCanvas = $("<canvas>")[0] as HTMLCanvasElement;
    let pieChart = new ChartGen().genEntityTypePie(
      pieCanvas.getContext("2d"),
      ...this.data
    );
    pieContainer.append(pieCanvas);

    let bubbleCanvas = $("<canvas>")[0] as HTMLCanvasElement;
    let bubbleChart = new ChartGen().genEntityBubble(
      bubbleCanvas.getContext("2d"),
      ...this.data
    );
    bubbleContainer.append(bubbleCanvas);
    entityChartContainer.append(pieContainer, bubbleContainer);

    return entityChartContainer;
  }
  private createScatterChart() {
    let scatterChartHolder = $("<div>").css(doubleChartParent);
    let scatterChartChild = $("<div>")
      .css(doubleChartChild)
      .css({ height: "50vh", margin: "auto" });
    let scatterCanvas = $("<canvas>")[0] as HTMLCanvasElement;
    let scatterChart = new ChartGen().genScatter(
      scatterCanvas.getContext("2d"),
      ...this.data
    );

    scatterChartChild.append(scatterCanvas);
    scatterChartHolder.append(scatterChartChild);
    return scatterChartHolder;
  }

  private createTweetDevCharts(){
    let retweetChartHolder = $("<div>").css(doubleChartParent);
    let retweetChartChild = $("<div>")
      .css(doubleChartChild)
      .css({ height: "50vh", margin: "auto" });
    let retweetCanvas = $("<canvas>")[0] as HTMLCanvasElement;
    let retweetChart = new ChartGen().genRetweetLine(
      retweetCanvas.getContext("2d"),
      ...this.data
    );

    retweetChartHolder.append(retweetCanvas);
    retweetChartHolder.append(retweetChartChild);
    return retweetChartHolder;
  }

  private genHashtagChart(){
    let hashtagChartHolder = $("<div>").css(doubleChartParent);
    let hashtagChartChild = $("<div>")
      .css(doubleChartChild)
      .css({ height: "50vh", margin: "auto" });
    let hashtagCanvas = $("<canvas>")[0] as HTMLCanvasElement;
    let hashtagChart = new ChartGen().genHashtags(
      hashtagCanvas.getContext("2d"),
      ...this.data
    );

    hashtagChartHolder.append(hashtagCanvas);
    hashtagChartHolder.append(hashtagChartChild);
    return hashtagChartHolder;
  }
}

const doubleChartParent = {
  display: "flex",
  "flex-direction": "row",
  width: "100%",
  "margin-bottom": "5%"
};
const doubleChartChild = {
  "flex-grow": 0,
  "flex-basis": "50%",
  "margin-left": "5%",
  "margin-right": "2.5%"
};



