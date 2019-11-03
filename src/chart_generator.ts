import { SummaryData } from "./panels/summary_panel";

import * as ChartJS from "chart.js";
import {extractEmoji, isEmoji} from "extract-emoji";

/*
declare interface Math{
  log10(x: number): number;
}*/
const natlog10 = Math.log(10);
function log10(n: number){
  return (Math.log(n) / natlog10);
}

const natlog2 = Math.log(2);
function log2(n: number){
  return (Math.log(n) / natlog2);
}

function sigmoid(n: number){
  return (1 / (1+Math.exp(-n)))
}

//https://stackoverflow.com/questions/43193341/how-to-generate-random-pastel-or-brighter-color-in-javascript/43195379
function randColor(n:number){ 
  /*
  return "hsl(" + 360 * Math.random() + ',' +
             (25 + 70 * Math.random()) + '%,' + 
             (50 + 45 * Math.random()) + '%)' */

  return "hsl(" + (360 * 1.618*n)%360 + ',' +
             (35 + 65 * Math.random()) + '%,' + 
             (30 + 50 * Math.random()) + '%)'
}
function randColors(len: number){
  let colors = [];
  for (let i=0; i<len; i++){
    colors.push(randColor(i));
  }
  return colors;
}

function emoji_test(str: string){
  //let str = "🤔 🙈 me así, bla es se 😌 ds 💕👭👙";
  console.log("String:"+str);
  let extr = extractEmoji(str);
  console.log("Emojis: "+extr);
}


let pointColors: string[]= [
  "rgba(215,159,125, 0.8)",
  "rgba(221,215,152, 0.8)",
  "rgba(167,221,152, 0.8)",
  "rgba(152,218,221, 0.8)",
  "rgba(144,179,218, 0.8)",
  "rgba(144,147,218, 0.8)",
  "rgba(193,140,217, 0.8)",
  "rgba(157,54,52, 0.8)",
  "rgba(149,99,50, 0.8)",
  "rgba(140,142,47, 0.8)",
  "rgba(47,142,47, 0.8)",
  "rgba(46,130,138, 0.8)",
  "rgba(46,84,138, 0.8)",
  "rgba(58,46,138, 0.8)",
  "rgba(106,46,138, 0.8)"
]

let fillColors: string[] = []; 
pointColors.forEach(color => { //Set 80% --> 40% opacity
  fillColors.push(color.replace("0.8", "0.4"));
});

let defaultFill: string = "rgba(64, 128, 255, 0.25)";
let userColors: string[] = [
  "rgba(0,0,250,0.4)",
  "rgba(250,0,0,0.4)",
  "rgba(0,250,0,0.4)",
  "rgba(250,250,0,0.4)",
  "rgba(0,250,250,0.4)",
  "rgba(250,0,250,0.4)",
  "rgba(0,0,150,0.4)",
  "rgba(150,0,0,0.4)",
  "rgba(0,150,0,0.4)",
  "rgba(150,150,0,0.4)",
  "rgba(0,150,150,0.4)",
  "rgba(150,0,150,0.4)",
]  

import { Entity } from "./nlp";
import { HashtagObject } from "./twitter";

export class ChartGen {
  
  public genScatter(
    ctx: CanvasRenderingContext2D,
    ...summaryData: SummaryData[]
  ) {
    let userdatas: { label: string; data: any[], 
      backgroundColor: string}[] = [];
    
    for(let sd=0; sd<summaryData.length; sd++){
      let sumdat : SummaryData = summaryData[sd];
      let plotData = [];

      let avg_retweets = 0;
      sumdat.tweets.forEach(tweet => {
        avg_retweets += tweet.tweetData.retweet_count; 
      });
      avg_retweets /= sumdat.tweets.length;
      //1+2*log2(tweetData.tweetData.retweet_count)

      for (let i = 0; i < sumdat.tweets.length; i++) {
        let tw = sumdat.tweets[i];
        plotData.push({
          x: tw.sentimentData.documentSentiment.score,
          y: sigmoid(tw.sentimentData.documentSentiment.magnitude),
          r: 3+5*(tw.tweetData.retweet_count / avg_retweets)
        });
      }
      userdatas.push({ label: sumdat.user.screen_name, 
        data: plotData, backgroundColor:userColors[sd]});
    };

    let chart = new ChartJS(ctx, {
      type: "bubble",
      data: { datasets: userdatas },
      options: {
        title: { display: true, text: "Sentiment of tweets" },
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              scaleLabel: { display: true, labelString: "Score" },
              type: "linear",
              position: "bottom"
            }
          ],
          yAxes: [{ scaleLabel: { display: true, labelString: "Magnitude" } }, ]
        },

        tooltips: {
          callbacks: {
            label: function(
              tootipItem: ChartJS.ChartTooltipItem,
              data: ChartJS.ChartData
            ) {
              return summaryData[tootipItem.datasetIndex].tweets[
                tootipItem.index
              ].tweetData.text;
            }
          }
        }
      }
    });
    return chart;
  }

  public genHourLine(
    ctx: CanvasRenderingContext2D,
    ...summaryData: SummaryData[]
  ) {
    const labels : string[] = [
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

    const daylight : string[] = [
      "#010404",
      "#122136",
      "#1B4B50",
      "#246B4C",
      "#32956F",
      "#97AC39",
      "#D0CE71",
      "#DBB994",
      "#C27579",
      "#BF4D40",
      "#A13650",
      "#732663",
    ]

    var gradientFill = ctx.createLinearGradient(500, 0, 100, 0);
    gradientFill.addColorStop(0, "rgba(0, 100, 150, 0.5)");
    gradientFill.addColorStop(0.4, "rgba(220, 220, 50, 0.5)");
    gradientFill.addColorStop(0.6, "rgba(220, 220, 50, 0.5)");
    gradientFill.addColorStop(1, "rgba(50, 100, 150, 0.5)");

    let userdatas: { label: string; data: any[], 
      pointBackgroundColor: string,
      borderColor: string,
      backgroundColor: any}[] = []; //string-->any

    for(let sd=0; sd<summaryData.length; sd++){
      let sumdat : SummaryData = summaryData[sd];
      let plotData: number[] = new Array();
      for (let val in labels) {
        plotData.push(0);
      }

      for (let i = 0; i < sumdat.tweets.length; i++) {
        let tweetTime = sumdat.tweets[i].tweetData.created_at;
        let hour = new Date(tweetTime).getUTCHours();
        let index = hour % labels.length;
        plotData[index]++;
      }
      userdatas.push({ label: sumdat.user.screen_name, data: plotData, 
        pointBackgroundColor: userColors[sd],
        borderColor: userColors[sd],
        backgroundColor:gradientFill});
    };

    let chart = new ChartJS(ctx, {
      type: "line",
      data: { labels: labels, datasets: userdatas },
      options: {
        title: { display: true, text: "Tweets by time of day" },
        scales: {
          xAxes: [{ scaleLabel: { display: true, labelString: "Time" } }],
          yAxes: [{ scaleLabel: { display: true, labelString: "Tweets"},
            ticks: {beginAtZero:true}}]
        }
      }
      /*
      data: {
        labels: labels,
        datasets: 
          { label: "Tweet Hours (UTC)", data: userdatas, 
          backgroundColor:defaultFill,
          pointBackgroundColor:pointColors,
          fill: "start",
          pointRadius: 5}
        ]
      }
      */
    });

    return chart;
  }
  public genDayLine(
    ctx: CanvasRenderingContext2D,
    ...summaryData: SummaryData[]
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
    //Issue: Not accurate if user tweets more per week than number of requested tweets!
    //Example: Fetching 50 tweets from Trump (>80tw/wk) results in inaccurate zero days.

    let userdatas: { label: string; data: any[], 
      pointBackgroundColor: string,
      borderColor: string,
      backgroundColor: string}[] = [];

    for(let sd=0; sd<summaryData.length; sd++){
      let sumdat : SummaryData = summaryData[sd];
      let plotData: number[] = new Array();
      for (let val in labels) {
        plotData.push(0);
      }

      for (let i = 0; i < sumdat.tweets.length; i++) {
        let tweetTime = sumdat.tweets[i].tweetData.created_at;
        let day = new Date(tweetTime).getUTCDay();
        let index = day % labels.length;
        plotData[index]++;
      }
      userdatas.push({ label: sumdat.user.screen_name, data: plotData, 
        pointBackgroundColor: userColors[sd], 
        borderColor: userColors[sd], 
        backgroundColor: defaultFill });
    };

    let chart = new ChartJS(ctx, {
      type: "line",
      data: { labels: labels, datasets: userdatas, },
      options: {
        title: { display: true, text: "Tweets by weekday" },
        scales: {
          xAxes: [{ scaleLabel: { display: true, labelString: "Day" } }],
          yAxes: [{ scaleLabel: { display: true, labelString: "Tweets"},
            ticks: {beginAtZero:true}}]
        }
      }
      /*
      data: {
        labels: labels,
       
        backgroundColor: defaultFill,
        pointBackgroundColor:pointColors,
        fill: "start",
        pointRadius: 5
        }]
      */
    });

    return chart;
  }

  public genEntityTypePie(
    ctx: CanvasRenderingContext2D,
    ...summaryData: SummaryData[]
  ) {
    let userdatas: { label: string; data: any[], 
      pointBackgroundColor: string[],
      backgroundColor: string[]}[] = [];
    let typeLabels: string[] = [];

    for(let sd=0; sd<summaryData.length; sd++){
      let sumdat : SummaryData = summaryData[sd];

      //let plotData: number[] = new Array();
      let entities = sumdat.entityResult.entities;
      let keys: string[] = [];
      let values: number[] = [];

      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];
        let index = keys.indexOf(entity.type);
        if (typeLabels.indexOf(entity.type) == -1) {
          typeLabels.push(entity.type);
        }
        if (index == -1) {
          keys.push(entity.type);
          values.push(1);
        } else {
          values[index]++;
        }
      }

      userdatas.push({ label: sumdat.user.screen_name, data: values, 
        pointBackgroundColor: pointColors,
        backgroundColor: fillColors });
    };

    let chart = new ChartJS(ctx, {
      type: "pie",
      data: { labels: typeLabels, datasets: userdatas },
      options: {
        title: { display: true, text: "Text entity composition" }
      }

      /*
      data: {
        labels: keys,
        datasets: [{ label: "Entity Types", data: values, backgroundColor:pointColors}]
      }
      */
    });
  }

  public genEntityBubble(
    ctx: CanvasRenderingContext2D,
    ...summaryData: SummaryData[]
  ) {
    let userdatas: { label: string; data: any[], 
      pointBackgroundColor: string,
      backgroundColor: string}[] = [];
      
    for (let sd = 0; sd < summaryData.length; sd++){
      let sumdat: SummaryData = summaryData[sd];
      let plotData: { x: number; y: number; r: number }[] = [];

      let keys: string[] = [];
      let values: {
        entity: Entity;
        count: number;
        totalSalience: number;
        entityType: string;
      }[] = [];
      let entityTypeNames: string[] = [];

      for (let i = 0; i < sumdat.entityResult.entities.length; i++) {
        let entity = sumdat.entityResult.entities[i];
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
            y: sigmoid(value.entity.sentiment.magnitude),
            r: 2+3*Math.log(value.totalSalience*1000)
              /*(0.75 * avgSalience + (0.25 * value.count) / totalMentions) *
              ctx.canvas.width *
              2*/
          };

          plotData.push(data);
        }

        //TODO: Use KeyColors if single users, otherwise color each user different
        /*
        let keyColors: string[] = [];
        values.forEach(val => {
          let colorIndex = entityTypeNames.indexOf(val.entityType);
          keyColors.push(pointColors[colorIndex]);
        });*/

        userdatas.push({ label: sumdat.user.screen_name, data: plotData,
          pointBackgroundColor: userColors[sd],
          backgroundColor: userColors[sd] });
     };

    let chart = new ChartJS(ctx, {
      type: "bubble",
      data: { datasets: userdatas },
      options: {
        maintainAspectRatio: false,
        title: { display: true, text: "Sentiment of text entities" },
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
              let ent = summaryData[tootipItem.datasetIndex].
                entityResult.entities[tootipItem.index]
              return "["+ent.type.toUpperCase()+"] "+ent.name
            }
          }
        }        
      }
    });
    return chart;
  }

  /*
  //TODO: Fix this method. Line chart only displays two almost-zero values.
  public genPopularity(
    summaryData: SummaryData,
    ctx: CanvasRenderingContext2D
  ) {
    let retweets: number[] = new Array();
    let favorites: number[] = new Array();

    console.log("Charting retweets of "+summaryData.tweets.length+" tweets...")
    for (let i = 0; i < summaryData.tweets.length; i++) {
      let td = summaryData.tweets[i].tweetData;
      //Todo: If tweet <24h, skip.
      retweets.push(td.retweet_count);
    }
    
    let chart = new ChartJS(ctx, {
      type: "line",
      data: {
        datasets: [
          { label: "Retweets", data: retweets, backgroundColor:"#ff6666"}
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
  */

 public genRetweetLine1(
  ctx: CanvasRenderingContext2D,
  ...summaryData: SummaryData[]
  ) {
    let userdatas: { label: string; data: any[], 
      pointBackgroundColor: string,
      borderColor: string,
      backgroundColor: any}[] = []; //string-->any

    for(let sd=0; sd<summaryData.length; sd++){
      let sumdat : SummaryData = summaryData[sd];
      let plotData: { x: number; y: number;}[] = [];

      for (let i = 0; i < sumdat.tweets.length; i++) {
        console.log("Adding tweet #"+i+": "+sumdat.tweets[i].tweetData.text);
        let tw = sumdat.tweets[i];
        let date = new Date(tw.tweetData.created_at).getUTCDate;
        plotData.push({
          x: i,
          y: tw.tweetData.retweet_count
        });
      }
      userdatas.push({ label: sumdat.user.screen_name, data: plotData, 
        pointBackgroundColor: userColors[sd],
        borderColor: userColors[sd],
        backgroundColor:userColors[sd]});
    };

    userdatas.forEach(ud => {
      console.log(ud.data.length+ " data entries");
    });

    let chart = new ChartJS(ctx, {
      type: "line",
      data: { datasets: userdatas },
      options: {
        title: { display: true, text: "Retweets popularity" },
        scales: {
          xAxes: [{ scaleLabel: { display: true, labelString: "Post" } }],
          yAxes: [{ scaleLabel: { display: true, labelString: "Retweets" } }]
        }
      }
    });

    return chart;
  }

  //==== REEEEEEE ====
  public genRetweetLine (
    ctx: CanvasRenderingContext2D,
    ...summaryData: SummaryData[]
  ) {
    //let labels : string[] = ["foo", "bar", "yee"];

    let userdatas: { label: string; data: any[], 
      pointBackgroundColor: string,
      borderColor: string,
      backgroundColor: string}[] = [];

    for(let sd=0; sd<summaryData.length; sd++){
      let sumdat : SummaryData = summaryData[sd];
      let plotData = [];

      for (let i = 0; i < sumdat.tweets.length; i++) {
        let tw = sumdat.tweets[i];
        plotData.push(tw.tweetData.retweet_count);
      }

      console.log("Pushing plotdata: "+plotData);
      console.log(plotData);
      userdatas.push({ label: sumdat.user.screen_name, data: plotData, 
        pointBackgroundColor: userColors[sd], 
        borderColor: userColors[sd], 
        backgroundColor: defaultFill });
        
    };

    let chart = new ChartJS(ctx, {
      type: "line",
      data: { datasets: userdatas },
      options: {
        title: { display: true, text: "debug debug debug" },
        scales: {
          xAxes: [{ scaleLabel: { display: true, labelString: "foofoo" } }],
          yAxes: [{ scaleLabel: { display: true, labelString: "barbar" } }]
        }
      }
    });

    return chart;
  }

  //TODO: Fix running outa colors etc
  public genHashtags(
    ctx: CanvasRenderingContext2D,
    ...summaryData: SummaryData[]
  ) {
    let userdatas: { label: string; data: any[],
      backgroundColor: string[]}[] = [];
    let tags: string[] = [];

    for(let sd=0; sd<summaryData.length; sd++){
      let sumdat = summaryData[sd];
      //let plotData: number[] = new Array();

      let keys: string[] = [];
      let values: number[] = [];

      let hashtag_count = 0;
      let symbol_count = 0;
      let url_count = 0;
      let mention_count = 0;

      let hashtags_all : string[] = [];
      
      for (let i = 0; i < sumdat.tweets.length; i++) {
        let tw = sumdat.tweets[i].tweetData;
        let ent = tw.entities;
        console.log("Tweet text:"+ tw.text);
        console.log("This tweet has \n-"
          +ent.hashtags.length+ " hashtags \n-",
          +"ent.media.length+ " +"media\n-",
          +ent.symbols.length+ " symbols\n-"
          +ent.urls.length+ " urls\n-",
          +ent.user_mentions.length + " mentions."
          );

        if (tw.hasOwnProperty("extended_entities")){
          console.log("\n\n>> HOLY SHIT THIS TWEET HAS MEDIA IN IT!! (tw)\n\n");
        }
        if (tw.hasOwnProperty("retweeted_status")){
          console.log("\n\n>>>> WOW, A REAL RETWEET! (tw)\n\n");
        }

        //Count mentions
        //let sortedTags = ent.user_mentions.sort(); 

        ent.user_mentions.forEach(mention => {
          let tag =  mention.name + " ("+mention.screen_name+")";
          hashtags_all.push(tag)
          let index = keys.indexOf(tag);
          if (tags.indexOf(tag) == -1) {
            tags.push(tag);
          }
          if (index == -1) {
            keys.push(tag);
            values.push(1);
          } else {
            values[index]++;
          }
        });

        /*
        ent.hashtags.forEach(ht => {
          let tag = "#"+ht.text.toLowerCase();
          hashtags_all.push(tag)
          let index = keys.indexOf(tag);
          if (typeLabels.indexOf(tag) == -1) {
            typeLabels.push(tag);
          }
          if (index == -1) {
            keys.push(tag);
            values.push(1);
          } else {
            values[index]++;
          }
        });
        */

        hashtag_count += ent.hashtags.length;
        symbol_count += ent.symbols.length;
        url_count += ent.urls.length;
        mention_count += ent.user_mentions.length;

        /*
        let index = keys.indexOf(tw.type);
        if (typeLabels.indexOf(entity.type) == -1) {
          typeLabels.push(entity.type);
        }
        if (index == -1) {
          keys.push(entity.type);
          values.push(1);
        } else {
          values[index]++;
        }
        */
      }

      console.log("=== TOTAL TWEET ENTITIES OF "+sumdat.user.screen_name+" ===");
      console.log("This user has in total \n-"
      +hashtag_count+" hashtags \n-",
      +symbol_count+ " symbols\n-"
      +url_count+ " urls\n-",
      +mention_count + " mentions."
      );
      console.log("Hashtags:"+hashtags_all);



      //arrayLabel = tags

      //arrayData = [16, 1, 14, 0, 0, 0, 1];
  
      let arrayOfObj = tags.map(function(d, i) {
        return {
          label: d,
          data: values[i] || 0
        };
      });
  
      let sortedArrayOfObj = arrayOfObj.sort(function(a, b) {
        return b.data - a.data;
      });
  
      let newArrayLabel = [];
      let newArrayData = [];
      sortedArrayOfObj.forEach(function(d){
        newArrayLabel.push(d.label);
        newArrayData.push(d.data);
      });
  
      console.log(newArrayLabel);
      console.log(newArrayData);


      userdatas.push({ label: sumdat.user.screen_name, data: newArrayData, 
        backgroundColor: randColors(values.length) });
      emoji_test(sumdat.compiledText);
    };


    //TODO: Get this sort working
    //https://www.npmjs.com/package/chartjs-plugin-sort
    let chart = new ChartJS(ctx, {
      type: "pie",
      data: { labels: tags, datasets: userdatas },
      options: {
        title: { display: true, text: "Hashtag usage" },
        plugins: {
          sort:
              {
                  enable: true,
                  sortBy: 'label',
                  order: 'desc',
              }
        }
      }
    });
    return chart;
  }  
}
