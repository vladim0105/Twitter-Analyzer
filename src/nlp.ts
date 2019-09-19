import * as Request from "request";

export type NLPSentimentData = {
  /** Sentiment for the whole text */
  documentSentiment: Sentiment;
  language: String;
  /** The sentences that make up this text */
  sentences: Sentence[];
};
export type NLPEntityData = {
  entities: Entity[];
  language: String;
};
type Entity = {
  name: string;
  type: string;
  /** How noticable/important this entity is */
  salience: Number;
  /** Sentiment for the entity */
  sentiment: Sentiment;
};
type Sentiment = {
  /** Represents the emotion */
  magnitude: Number;
  /** Represent positivity, is in range [-1, 1] */
  score: Number;
};
type Sentence = {
  text: string;
  /** Sentiment for the sentence */
  sentiment: Sentiment;
};

const apiKey = "AIzaSyAazERmq44usU8UkExRTQ0N7ODWZ2yDCqQ";
const sentimentAnalysisURL =
  "https://language.googleapis.com/v1beta2/documents:analyzeSentiment?key=" +
  apiKey;
const entityAnalysisURL =
  "https://language.googleapis.com/v1beta2/documents:analyzeEntitySentiment?key=" +
  apiKey;
export class NLPAPI {
  private fetchData(url: string, text: String, callback: (data: any) => void) {
    let postData = {
      content: text,
      type: "PLAIN_TEXT"
    };
    Request(
      {
        url: url,
        method: "POST",
        json: true, // <--Very important!!!
        body: { document: postData }
      },
      function(error, response, body) {
        if (error) {
          console.log(error);
        } else {
          console.log("Response from Google:");
          console.log(response);
          callback(body);
        }
      }
    );
  }
  /**
   * Analyzes the given text for sentiment. Later returns the results in the callback method.
   */
  public fetchSentimentAnalysis(
    text: String,
    callback: (data: NLPSentimentData) => void
  ) {
    this.fetchData(sentimentAnalysisURL, text, callback);
  }
  /**
   * Analyzes the given text for entities. Later returns the results in the callback method.
   */
  public fetchEntityAnalysis(
    text: String,
    callback: (data: NLPEntityData) => void
  ) {
    this.fetchData(entityAnalysisURL, text, callback);
  }
}
