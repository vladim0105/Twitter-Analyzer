import { Panel } from "./panel";
import { TweetData, TwitterUser } from "../twitter";
import * as $ from "jquery";
import { NLPSentimentData, NLPEntityData } from "../nlp";
export type SummaryData = {
  user: TwitterUser;
  sentimentResult: NLPSentimentData;
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
      "Overall Sentiment: " + this.data.sentimentResult.documentSentiment.score
    );
    let magnitudeText = $("<p>").text(
      "Overall Magnitude: " +
        this.data.sentimentResult.documentSentiment.magnitude
    );

    nameContainer.append(name, handle);
    imageContainer.append(img);
    sentimentContainer.append(sentimentText, magnitudeText);

    this.getMain().append(nameContainer);
    this.getMain().append(imageContainer);
    this.getMain().append(sentimentContainer);
    this.getMain()
      .css("border", "2px solid gray")
      .css("border-radius", "5px");
  }

  private nameStyle = { display: "block", margin: 0 };
}
