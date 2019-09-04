export type TwitterUser = {
  id: Number;
  name: String;
  screen_name: String;
  description: String;
};

export type TwitterData = {
  user: TwitterUser;
  text: String;
};

export class TwitterAPI {
  /**
   * GET Request the TwitterAPI, returns a TwitterData object.
   * Will probably take a string (a username) as input argument.
   */
  public fetch(username: String) {}
}
