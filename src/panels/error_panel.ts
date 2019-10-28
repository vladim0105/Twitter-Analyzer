import { Panel } from "./panel";

import * as $ from "jquery";
export class ErrorPanel extends Panel {
  private msg: string;
  constructor(msg: string) {
    super("100%", "auto");
    this.msg = msg;
    this.init();
  }
  private init() {
    let textContainer = $("<div>").css({ "text-align": "center" });
    let errorMsg = $("<p>")
      .text(this.msg)
      .css({ color: "red" });

    textContainer.append(errorMsg);

    this.getMain().append(textContainer);

    this.getMain()
      .css("border", "2px solid red")
      .css("border-radius", "5px");
  }
}
