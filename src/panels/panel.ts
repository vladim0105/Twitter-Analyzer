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
  }
  protected getMain() {
    return this.main;
  }
  protected profilePictureStyle = {
    "border-radius": "50%",
    "margin-top": "2%",
    "margin-bottom": "2%"
  };
  private mainStyle = { display: "flex", "flex-direction": "column" };
}
