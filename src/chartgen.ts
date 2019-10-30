import { SummaryData } from "./panels/summary_panel";

import * as ChartJS from "chart.js";
import { Entity } from "./nlp";

export class ChartGen {
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
  }

  public genEntityChart(
    summaryData: SummaryData,
    ctx: CanvasRenderingContext2D
  ) {
    let plotData: { x: number; y: number; r: number }[] = [];

    let keys: string[] = [];
    let values: { entity: Entity; count: number; totalSalience: number }[] = [];
    for (let i = 0; i < summaryData.entityResult.entities.length; i++) {
      let entity = summaryData.entityResult.entities[i];
      if (entity.type == "OTHER") {
        continue;
      }
      let index = keys.indexOf(entity.name);
      if (index == -1) {
        keys.push(entity.name);
        values.push({
          entity: entity,
          count: entity.mentions.length,
          totalSalience: entity.salience
        });
      } else {
        values[index].count += entity.mentions.length;
        values[index].totalSalience += entity.salience;
      }
    }
    let totalMentions = 0;
    for (let i = 0; i < values.length; i++) {
      totalMentions += values[i].count;
    }
    for (let i = 0; i < keys.length; i++) {
      let value = values[i];
      let avgSalience = value.totalSalience / value.count;
      let data = {
        x: value.entity.sentiment.score,
        y: value.entity.sentiment.magnitude,
        r:
          (0.75 * avgSalience + (0.25 * value.count) / totalMentions) *
          ctx.canvas.width *
          2
      };
      plotData.push(data);
    }

    let chart = new ChartJS(ctx, {
      type: "bubble",
      data: { datasets: [{ label: "Likeable entities", data: plotData }] },
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
              let value = values[tootipItem.index];
              return (
                keys[tootipItem.index] +
                "{" +
                value.count +
                "," +
                value.totalSalience / value.count +
                "}"
              );
            }
          }
        }
      }
    });
    return chart;
  }
}
