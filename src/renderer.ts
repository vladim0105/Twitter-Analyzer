import { NLPAPI, NLPData } from "./nlp";
import * as $ from "jquery";

let nlp = new NLPAPI();

$(document).ready(function() {
  console.log($("#submit"));
  $("#submit").click(function() {
    nlp.fetch($("#username").val() as String, test);
  });
});

function test(data: NLPData) {
  console.log(
    "Score: " +
      data.documentSentiment.score +
      ", magnitude: " +
      data.documentSentiment.magnitude
  );
}
