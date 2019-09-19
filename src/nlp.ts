import * as Request from "request";

export type NLPData = {
  documentSentiment: Sentiment;
  language: String;
};

export type Sentiment = {
  magnitude: Number; //Emotion
  score: Number; //Positivity
};

const apiKey = "AIzaSyAazERmq44usU8UkExRTQ0N7ODWZ2yDCqQ";

export class NLPAPI {
  /**
   * GET Request the NLPAPI, returns a NLPData object.
   * Will probably take a string (the text of a tweet) as input argument.
   */
  constructor() {}
  public fetch(text: String, callback: (data: NLPData) => void) {
    let postData = {
      content: text,
      type: "PLAIN_TEXT"
    };
    Request(
      {
        url:
          "https://language.googleapis.com/v1beta2/documents:analyzeSentiment?key=" +
          apiKey,
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
}
