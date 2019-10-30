import { SummaryData } from "./panels/summary_panel";
import {
  NaturalLanguageProcessingAPI,
  NLPEntityData,
  NLPSentimentData
} from "./nlp";

import * as ChartJS from "chart.js";

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
  public genHourLineGraph(
    summaryData: SummaryData,
    ctx: CanvasRenderingContext2D
  ) {
    let labels = [
      "00:00-02:00",
      "02:00-04:00",
      "04:00-06:00",
      "06:00-08:00",
      "08:00-10:00",
      "10:00-12:00",
      "12:00-14:00",
      "14:00-16:00",
      "16:00-18:00",
      "18:00-20:00",
      "20:00-22:00",
      "22:00-24:00"
    ];
    let data: number[] = new Array();
    for (let val in labels) {
      data.push(0);
    }

    for (let i = 0; i < summaryData.tweets.length; i++) {
      let tweetTime = summaryData.tweets[i].tweetData.created_at;
      let hour = new Date(tweetTime).getUTCHours();
      let index = hour % labels.length;
      data[index]++;
    }

    let chart = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{ label: "Tweet Hours (UTC)", data: data }]
      }
    });

    return chart;
  }
  public genDayLineGraph(
    summaryData: SummaryData,
    ctx: CanvasRenderingContext2D
  ) {
    let labels = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ];
    let data: number[] = new Array();
    for (let val in labels) {
      data.push(0);
    }

    for (let i = 0; i < summaryData.tweets.length; i++) {
      let tweetTime = summaryData.tweets[i].tweetData.created_at;
      let day = new Date(tweetTime).getUTCDay();
      let index = day % labels.length;
      data[index]++;
    }

    let chart = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{ label: "Tweet Days (UTC)", data: data }]
      }
    });

    return chart;
  }

  public genEntityTypePieChart(
    summaryData: SummaryData,
    ctx: CanvasRenderingContext2D
  ) {
    let entities = summaryData.entityResult.entities;
    let keys: string[] = [];
    let values: number[] = [];
    console.log(entities);
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      let index = keys.indexOf(entity.type);
      if (index == -1) {
        keys.push(entity.type);
        values.push(1);
      } else {
        values[index]++;
      }
    }
    let chart = new ChartJS(ctx, {
      type: "pie",
      data: {
        labels: keys,
        datasets: [{ label: "Entity Types", data: values }]
      }
    });

    return chart;
  }
}
