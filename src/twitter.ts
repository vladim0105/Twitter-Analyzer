import * as Request from "request";

export type TwitterUser = {
  id: Number;
  name: String;
  screen_name: String;
  description: String; //Account bio/description
};

export type TweetData = {
  user: TwitterUser;
  text: String; //Tweet text contents
};

export type TwitterAccessToken = {
  token_type: string;
  access_token: string;
};

const consumerKey = "YrR8eb5C5vlWHl3bv1iWvk25P";
const consumerSecretKey = "HFGL588Q8EoTry7G2HY7zhnIVA1zX5ykbIxyRTkh0RSZWekH7H";

const bearerToken = rcfEncode(consumerKey) + ":" + rcfEncode(consumerSecretKey);
const base64_bearerToken = Buffer.from(bearerToken).toString("base64");

export class TwitterAPI {
  public getAuthToken(callback: (data: TwitterAccessToken) => void) {
    Request(
      {
        url: "https://api.twitter.com/oauth2/token",
        method: "POST",
        form: {
          grant_type: "client_credentials"
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          Authorization: "Basic " + base64_bearerToken
        }
      },
      function(error, response, body) {
        if (error) {
          console.log(error);
        } else {
          console.log("Response from Twitter:");
          console.log(response);
          callback(JSON.parse(body));
        }
      }
    );
  }
  /**
   * Requests the 200 newest tweets from the given user account.
   * It will return them in the callback function when theyre ready.
   */
  public fetchTweets(
    authToken: string,
    username: String,
    callback: (data: TweetData[]) => void
  ) {
    console.log(authToken);
    Request(
      {
        url: "https://api.twitter.com/1.1/statuses/user_timeline.json",
        method: "GET",
        qs: {
          screen_name: username,
          count: 200 //Max amount of tweets we can request.
        },
        headers: {
          Authorization: "Bearer " + authToken
        }
      },
      function(error, response, body) {
        if (error) {
          console.log(error);
        } else {
          console.log("Response from Twitter:");
          console.log(JSON.parse(body));
          callback(JSON.parse(body));
        }
      }
    );
  }
}

function rcfEncode(str: string) {
  return encodeURIComponent(str)
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A");
}
