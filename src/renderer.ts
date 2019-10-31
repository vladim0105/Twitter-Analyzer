import { Logic } from "./logic";
import * as $ from "jquery";
import { TwitterUser } from "./twitter";
import {
  NLPSentimentData,
  NLPEntityData,
  NaturalLanguageProcessingAPI,
  TEST_DATA,
  TEST_ENTITYDATA
} from "./nlp";
import { ChartGen } from "./chart_generator";

$(document).ready(() => {
  new Logic();
  document.getElementById("username").focus();
});
