import { SummaryData } from "./panels/summary_panel";

import * as ChartJS from "chart.js";
import { start } from "repl";
import { TweetPanel } from "./panels/tweet_panel";

let defaultColors : string[] = [
  "#E27E7D","#D79F7D","#DDD798","#A7DD98",
  "#98DADD","#90B3DA","#9093DA","#C18CD9",
  "#9D3634","#956332","#8C8E2F","#2F8E2F",
  "#2E828A","#2E548A","#3A2E8A","#6A2E8A"
]
let defaultFill : string = "rgba(64, 128, 255, 0.5)";

import { Entity } from "./nlp";
import { Data } from "electron";

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
        datasets: [
          { label: "Tweet Hours (UTC)", data: data, 
          backgroundColor:defaultFill,
          pointBackgroundColor:defaultColors,
          fill: "start",
          pointRadius: 5}
        ]
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
        datasets: [{ label: "Tweet Days (UTC)", data: data, 
        backgroundColor: defaultFill,
        pointBackgroundColor:defaultColors,
        fill: "start",
        pointRadius: 5
        }]
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
        datasets: [{ label: "Entity Types", data: values, backgroundColor:defaultColors}]
      }
    });
  }

  public genEntityBubbleChart(
    summaryData: SummaryData,
    ctx: CanvasRenderingContext2D
  ) {
    let plotData: { x: number; y: number; r: number }[] = [];

    let keys: string[] = [];
    let values: { entity: Entity; count: number; totalSalience: number, entityType: string}[] = [];
    let entityTypeNames: string[] = [];

    for (let i = 0; i < summaryData.entityResult.entities.length; i++) {
      let entity = summaryData.entityResult.entities[i];
      if (entity.type == "OTHER") {
        continue;
      }

      //Count entity
      let index = keys.indexOf(entity.name);
      if (index == -1) {
        keys.push(entity.name);
        values.push({
          entity: entity,
          count: entity.mentions.length,
          totalSalience: entity.salience,
          entityType: entity.type
        });
      } else {
        values[index].count += entity.mentions.length;
        values[index].totalSalience += entity.salience;
      }

      //Register entity type
      index = entityTypeNames.indexOf(entity.type);
      if (index == -1) {
        entityTypeNames.push(entity.type);
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

    let keyColors: string[] = []
    values.forEach(val => {
      let colorIndex = entityTypeNames.indexOf(val.entityType);
      keyColors.push(defaultColors[colorIndex]);
    });


    let chart = new ChartJS(ctx, {
      type: "bubble",
      data: {
        datasets: [
          {
            label: "Likeable entities",
            data: plotData,
            pointBackgroundColor: keyColors,
            backgroundColor: keyColors
          }
        ]
      },
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

  //TODO: Fix this method. Line chart only displays two almost-zero values.
  public genPopularityChart(
    summaryData: SummaryData,
    ctx: CanvasRenderingContext2D
  ) {
    let retweets: number[] = new Array();
    let favorites: number[] = new Array();

    console.log("Charting rt and favs of "+summaryData.tweets.length+" tweets...")
    for (let i = 0; i < summaryData.tweets.length; i++) {
      let td = summaryData.tweets[i].tweetData;
      //Todo: If tweet <24h, skip.
      retweets.push(td.retweet_count);
      favorites.push(td.favorite_count);
    }
    
    let chart = new ChartJS(ctx, {
      type: "line",
      data: {
        datasets: [
          { label: "Retweets", data: retweets, backgroundColor:"#ff6666"},
          { label: "Favorites", data: favorites, backgroundColor:"#6666ff"}
        ]
      },
      options: {
        tooltips: {
          callbacks: {
            label: function(
              tootipItem: ChartJS.ChartTooltipItem,
              data: ChartJS.ChartData
            ) {
              return summaryData.tweets[tootipItem.index].tweetData.text
            }
          }
        }
      }
    });
  
    return chart;
  }

  //TODO: Fix this method. Line chart only displays two almost-zero values.
  public genSentimentDevelopment(
    summaryData: SummaryData,
    ctx: CanvasRenderingContext2D
  ) {
    let mood = [];
    
    console.log("Charting sentiment of "+summaryData.tweets.length+" tweets...")
    for (let i = 0; i < summaryData.tweets.length; i++) {
      let tw = summaryData.tweets[i];
      let positivity: number = 0;
      tw.sentimentData.sentences.forEach(sentence => {
        positivity += sentence.sentiment.score * (0.1+sentence.sentiment.magnitude);
      });
      mood.push({x: i, y: positivity});
    }
    console.log("mood.length: "+mood.length);
    console.log(mood); //debug

    let chart = new ChartJS(ctx, {
      type: "line",
      data: {
        datasets: [
          { label: "Sentiment", data: mood, backgroundColor:"#6666ff"}
        ]
      },
      
      options: {
        tooltips: {
          callbacks: {
            label: function(
              tootipItem: ChartJS.ChartTooltipItem,
              data: ChartJS.ChartData
            ) {
              return summaryData.tweets[tootipItem.index].tweetData.text;
            }
          }
        },
        scales: {
          xAxes: [{scaleLabel: { display: true, labelString: "Time" }}],
          yAxes: [{scaleLabel: { display: true, labelString: "Positivity" }}]
        }
      }
    });
  
    return chart;
  }
}

