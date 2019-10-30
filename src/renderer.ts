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
import { ChartGen } from "./chartgen";

$(document).ready(() => {
  new Logic();
});
