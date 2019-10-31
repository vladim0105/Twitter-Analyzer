import * as Request from "request";
import * as isDev from "electron-is-dev";
export type TwitterUser = {
  // === Identifying data
  id: Number; // unique internal numeral ID
  name: string; // Pretty-printed name, eg "Donald Trump"
  screen_name: string; // unique twitter handle, eg: realDonaldTrump
  description: string; // bio/description

  profile_image_url_https: string; //url to profiile pic

  // === Stats
  verified: Boolean; // Verified public figure
  followers_count: Number; // following this user
  friends_count: Number; // friends of user
  statuses_count: Number; // tweets posted
  listed_count: Number; // public lists

  //TODO: Number or number here?
};

//TODO: Fix experimental export:
export type TweetEntities = {
  hashtags: any[];
  media: any[];
  symbols: any[];
  urls: any[];
  user_mentions: any[];
}

export type TweetData = {
  user: TwitterUser;
  /** Contents of the tweet */
  text: string;
  created_at: string;
  retweet_count: number; 
  coordinates: Coordinates; //?null
  entities: TweetEntities[];
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
    Request(
      {
        url: "https://api.twitter.com/1.1/statuses/user_timeline.json",
        method: "GET",
        qs: {
          screen_name: username,
          count: isDev ? 50 : 200 //Max amount of tweets we can request.
        },
        headers: {
          Authorization: "Bearer " + authToken
        }
      },
      function(error, response, body) {
        if (error) {
          console.log(error);
        } else {
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
