import { Request } from "request";

export type TwitterUser = {
  id: Number;
  name: String;
  screen_name: String;
  description: String; //Account bio/description
};

export type TwitterData = {
  user: TwitterUser;
  text: String; //Tweet text contents
};

export class TwitterAPI {
  /**
   * POST Request the TwitterAPI, returns a TwitterData object.
   * Will probably take a string (a username) as input argument.
   */
  public fetch(username: String) {}
}
