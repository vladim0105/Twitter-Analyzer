const Language = require("@google-cloud/language");

export type NLPData = {};

const apiKey = "AIzaSyAazERmq44usU8UkExRTQ0N7ODWZ2yDCqQ";

export class NLPAPI {
  /**
   * GET Request the NLPAPI, returns a NLPData object.
   * Will probably take a string (the text of a tweet) as input argument.
   */
  constructor() {
    const client = Language.LanguageServiceClient();
    let document = { content: "Hello", type: "PLAIN_TEXT" };
    console.log(document);
  }
  public fetch(text: String) {}
}
