import * as $ from "jquery";
export class Panel {
  /** The DOM Object that contains this panel */
  private main: JQuery<HTMLElement>;
  /**
   * Creates a panel object
   * @param width the CSS width of this object
   * @param height the CSS height of this object
   */
  constructor(width: string, height: string) {
    this.main = $("<div>", { width: width, height: height }).css(
      this.mainStyle
    );
  }
  /**
   * Appends this panel to a HTML DOM Element
   * @param target The target DOM Element to append to
   */
  public appendTo(target: JQuery<HTMLElement>) {
    target.append(this.main);
    this.getMain().animate({ opacity: 1 }, "slow");
  }
  protected getMain() {
    return this.main;
  }
  protected profilePictureStyle = {
    "border-radius": "50%",
    "margin-top": "2%",
    "margin-bottom": "2%",
    zoom: "50%"
  };

  protected tweetPictureStyle = {
    "border-radius": "50%",
    display: "block",
    margin: "0%",
    zoom: "50%"
  };

  private mainStyle = {
    display: "flex",
    "flex-direction": "column",
    opacity: 0
  };
  /**
   * Transforms a full number into a string shorthand
   * E.g. 2000 -> 2K
   */
  protected bigNumStr(n: number) {
    let K = 1000,
      M = 1000000; //Thousand, Million.
    if (n < 10 * K) return "" + n; //Print normal
    let postfix = n < 1 * M ? K : M; //Determine K or M postfix
    let decimals = n % postfix < postfix / 10 ? 0 : 1; //Do "1" instead of "1.0"
    let str = (n / postfix).toFixed(decimals); //12345 --> 12.3
    return str + (n < 1 * M ? "K" : "M"); //12.3K
  }
  /**
   * Formats a string with score and magnitude
   * @param score Sentiment score
   * @param magnitude Sentiment magnitude
   */
  protected sentimentString(score: number, magnitude: number) {
    let scoreStr = score > 0 ? "+" : "" + score.toFixed(2); //Score <-1..1>
    let magnitudeStr = "" + magnitude.toFixed(2); //Magnitude typically < 1, can be above.
    return "[" + (score > 0 ? "+" : "") + score + " * " + magnitude + "]";
  }

  /**
   * Returns index month as string with a specific number of characters
   * @param mDate Index of date. 0: January, 1: Febrary...
   * @param chars (Optional) Number of strings to use. None: "January", 3: "Jan"
   */
  protected month(mDate: Date, chars?: number) {
    let months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    let str = months[mDate.getMonth()];
    if (!chars) chars = 0;
    return months[mDate.getMonth()].substr(0, chars);
  }
}
