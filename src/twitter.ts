import * as Request from "request";
import * as isDev from "electron-is-dev";
import { ErrorPanel } from "./panels/error_panel";
import * as $ from "jquery";
import { Logic, displayError } from "./logic";
export type TwitterUser = {
  // === Identifying data
  id: number; // unique internal numeral ID
  name: string; // Pretty-printed name, eg "Donald Trump"
  screen_name: string; // unique twitter handle, eg: realDonaldTrump
  description: string; // bio/description

  profile_image_url_https: string; //url to profiile pic

  // === Stats
  verified: boolean; // Verified public figure
  created_at: string; //Account creation date
  followers_count: number; // following this user
  friends_count: number; // friends of user
  statuses_count: number; // tweets posted
  listed_count: number; // public lists

  //TODO: Number or number here?
};

export type HashtagObject = {
  text: string;
}
export type URLObject = {
  display_url: string; //url as displayed
  expanded_url: string; //expanded into browser
}
export type MentionObject = {
  id: number; //id of mentioned user
  name: string; //Display name of mentioned
  screen_name: string; //Unique handle of mentioned
}
export type Place = {
  id: number; 
  place_type: string; //"city"
  name: string; //human-readable
  full_name: string; //Manhattan, NY
  country_code: string; //US
  country: string; //United States
}

//TODO: Fix experimental export:
export type TweetEntities = {
  hashtags: HashtagObject[]; // #hashtag
  media: any[]; // Note: Nonexistent if no embedded media
  urls: URLObject[];
  user_mentions: MentionObject[]; 
  symbols: any[]; // ???
}

export type TweetData = {
  user: TwitterUser;
  /** Contents of the tweet */
  text: string;
  created_at: string;
  favorite_count: number;
  retweet_count: number; 
  coordinates: Coordinates; //?null
  entities: TweetEntities;
  retweeted_status: any; //Exists only if this post is a retweet
  retweeted: boolean;
  place: Place;
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
          displayError("Error connecting to Twitter API");
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
          displayError("Error connecting to Twitter API");
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
