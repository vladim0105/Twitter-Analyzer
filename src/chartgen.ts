import { SummaryData } from "./panels/summary_panel";
import {
  NaturalLanguageProcessingAPI,
  NLPEntityData,
  NLPSentimentData
} from "./nlp";

import * as ChartJS from "chart.js";
import { ENGINE_METHOD_DIGESTS } from "constants";

export class ChartGen {
  public tweetGraph(data: NLPEntityData, ctx: CanvasRenderingContext2D) {
    console.log("Lang: " + data.language);
    data.entities.forEach(element => {
      console.log(
        "Ent " + element.name + "'s score: " + element.sentiment.score
      );
    });
    let myChart = new ChartJS(ctx, {
      type: "pie",
      data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [
          {
            label: "# of Votes",
            data: [1, 3, 5, 2, 3],
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)"
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      }
    });
  }

  public genScatterChart(
    summaryData: SummaryData,
    ctx: CanvasRenderingContext2D
  ) {
    let plotData = [];
    for (let i = 0; i < summaryData.tweets.length; i++) {
      let tweetData = summaryData.tweets[i];
      plotData.push({
        x: tweetData.sentimentData.documentSentiment.score,
        y: tweetData.sentimentData.documentSentiment.magnitude
      });
    }
    let chart = new ChartJS(ctx, {
      type: "scatter",
      data: { datasets: [{ label: "Tweet Sentiments", data: plotData }] },
      options: {
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              scaleLabel: { display: true, labelString: "Score" },
              type: "linear",
              position: "bottom"
            }
          ],
          yAxes: [{ scaleLabel: { display: true, labelString: "Magnitude" } }]
        },
        tooltips: {
          callbacks: {
            label: function(
              tootipItem: ChartJS.ChartTooltipItem,
              data: ChartJS.ChartData
            ) {
              return summaryData.tweets[tootipItem.index].tweetData.text;
            }
          }
        }
      }
    });
    return chart;
  }


  public genEntityChart(
    summaryData: SummaryData,
    ctx: CanvasRenderingContext2D
  ) {

    let plotData = [];
    let tags : string[] = [];

    let totalMentions = 0;

    console.log(">> Analyzing "+summaryData.entityResult.entities.length+" different entities");
    for (let i = 0; i < summaryData.entityResult.entities.length; i++){
      let ent = summaryData.entityResult.entities[i];
      totalMentions += ent.mentions.length;
    }
    console.log(">> Total entity mentions of all: "+totalMentions);
    console.log("Analyzing "+summaryData.entityResult.entities.length+ " entities...");
    for (let i = 0; i < summaryData.entityResult.entities.length; i++) { 
      let ent = summaryData.entityResult.entities[i];
      //if (ent.type == "OTHER" || ent.type == "UNKNOWN") continue; //Skip
      //let entScore = ent.salience * ent.sentiment.magnitude * ent.sentiment.score;
      //if (entScore == 0) continue;
      plotData.push({
        x: ent.sentiment.score,
        y: ent.sentiment.magnitude,
        r: ctx.canvas.width*(ent.mentions.length / totalMentions)
      });
      tags.push(ent.name);

      //if (entScore > maxScore)
      console.log("Ent: "+ent.name+" is "+ent.type+" -->" + ent.salience+" ("+ent.sentiment.score+"*"+ent.sentiment.magnitude+")");
      plotData.push({
        x: ent.name,
        y: ent.sentiment.score
      });
      
    }

    let chart = new ChartJS(ctx, {
      type: "bubble",
      data: { datasets: [{ label: "Likeable entities", data: plotData}] },
      options: {
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              scaleLabel: { display: true, labelString: "Score" },
              type: "linear",
              position: "bottom"
            }
          ],
          yAxes: [{ scaleLabel: { display: true, labelString: "Magnitude" } }]
        },
        
        tooltips: {
          callbacks: {
            label: function(
              tootipItem: ChartJS.ChartTooltipItem,
              data: ChartJS.ChartData
            ) {
              return tags[tootipItem.index];
            }
          }
        }
        
      }
    });
    return chart;
  }
}
