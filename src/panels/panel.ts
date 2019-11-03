import * as $ from "jquery";
export class Panel {
  private main: JQuery<HTMLElement>;
  constructor(width: string, height: string) {
    this.main = $("<div>", { width: width, height: height }).css(
      this.mainStyle
    );
  }

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
  private mainStyle = {
    display: "flex",
    "flex-direction": "column",
    opacity: 0
  };

  protected bigNumStr(n: number){
    let K = 1000, M=1000000; //Thousand, Million.
    if (n<10*K) return ""+n; //Print normal
    let postfix = (n<1*M) ? K : M; //Determine K or M postfix
    let decimals = (n%postfix < postfix/10) ? 0 : 1; //Do "1" instead of "1.0"
    let str = (n/postfix).toFixed(decimals); //12345 --> 12.3
    return str + ((n<1*M) ? "K":"M"); //12.3K
  }

  protected sentimentString(score: number, magnitude: number){
    let scoreStr = (score > 0) ? "+":"" + score.toFixed(2); //Score <-1..1>
    let magnitudeStr = ""+magnitude.toFixed(2); //Magnitude typically < 1, can be above.
    return "["+(score > 0 ? "+":"") + score + " * " + magnitude +"]";

    //let scoreIndex = (1+score)*20
    //switch 😐
  }
}
