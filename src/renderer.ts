import { Logic } from "./logic";
import * as $ from "jquery";
import { TwitterUser } from "./twitter";
import { NLPSentimentData, NLPEntityData, NaturalLanguageProcessingAPI, TEST_DATA, TEST_ENTITYDATA } from "./nlp";
import { ChartGen } from "./chartgen";

$(document).ready(() => {
  new Logic();
  let test = $("#entityCanvas")[0];
let ctx = (test as HTMLCanvasElement).getContext("2d");
let cg:ChartGen = new ChartGen();
cg.tweetGraph(TEST_ENTITYDATA, ctx)
});