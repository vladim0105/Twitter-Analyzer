import { SummaryData } from "./panels/summary_panel";

import * as ChartJS from "chart.js";
import {extractEmoji, isEmoji} from "extract-emoji";

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
  fillColors.push(color.replace("0.8", "0.5"));
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
import { Panel } from "./panels/panel";

export class ChartGen {
  
  public genTweetSentiments(
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

    /*
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
    ]*/

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
      backgroundColor: string[],
      hovertags: string[]}[] = [];
    let typeLabels: string[] = [];


    for(let sd=0; sd<summaryData.length; sd++){
      let sumdat : SummaryData = summaryData[sd];
      let hovertags = [];
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
        backgroundColor: fillColors,
        hovertags: keys });
    };

    let chart = new ChartJS(ctx, {
      type: "pie",
      data: { datasets: userdatas },
      options: {
        title: { display: true, text: "Text entity composition" },
        tooltips: {
          callbacks: {
            label: function(
              tootipItem: ChartJS.ChartTooltipItem,
              data: ChartJS.ChartData
            ) {
              return userdatas[tootipItem.datasetIndex].hovertags[tootipItem.index];
            }
          }
        }        
      }
    });
    return chart;
  }


  public genEntitySentiment(
    ctx: CanvasRenderingContext2D,
    ...summaryData: SummaryData[]
  ) {
    let userdatas: { label: string; data: any[], 
        pointBackgroundColor: string,
        backgroundColor: string,
        hovertags: string[]
      }[] = [];
      
    for (let sd = 0; sd < summaryData.length; sd++){
      let sumdat: SummaryData = summaryData[sd];
      let plotData: { x: number; y: number; r: number }[] = [];

      let keys: string[] = [];
      let hovertags: string[] = [];
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
          hovertags.push(entity.name+" ("+entity.type+")");
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
            r: 2+3*Math.log(value.totalSalience*1000),
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
          backgroundColor: userColors[sd],
          hovertags: hovertags});
     };


    //TODO: Fix misassigned text entities
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
              return userdatas[tootipItem.datasetIndex].hovertags[tootipItem.index];
            }
          }
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

  //TODO: Bug: Inner circle gets outer circle's mentions
  public genMentions(
    ctx: CanvasRenderingContext2D,
    ...summaryData: SummaryData[]
  ) {
    let userdatas: { label: string; data: any[],
      backgroundColor: string[],
      hovertags: string[]}[] = [];

    for(let sd=0; sd<summaryData.length; sd++){
      let sumdat = summaryData[sd];

      let keys: string[] = [];
      let values: number[] = [];
      let tags: string[] = [];
      
      for (let i = 0; i < sumdat.tweets.length; i++) {
        let ent = sumdat.tweets[i].tweetData.entities;

        //Count mentions
        ent.user_mentions.forEach(mention => {
          let name = "@"+mention.screen_name;
          //mentions.push(name)
          let index = keys.indexOf(name);
          if (tags.indexOf(name) == -1) {
            tags.push(name);
          }
          if (index == -1) {
            keys.push(name);
            values.push(1);
          } else {
            values[index]++;
          }
        });
      }
  
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
        backgroundColor: randColors(values.length),
        hovertags: newArrayLabel });
    };


    //TODO: Get this sort working
    //https://www.npmjs.com/package/chartjs-plugin-sort
    let chart = new ChartJS(ctx, {
      type: "pie",
      data: {datasets: userdatas },
      options: {
        title: { display: true, text: "User mentions" },
        plugins: {
          sort:
              {
                  enable: true,
                  sortBy: 'label',
                  order: 'desc',
              }
        },
        tooltips: {
          callbacks: {
            label: function(
              tootipItem: ChartJS.ChartTooltipItem,
              data: ChartJS.ChartData
            ) {

              let dat = userdatas[tootipItem.datasetIndex];
              let count = dat.data[tootipItem.index]
              let poster = "@"+summaryData[tootipItem.datasetIndex].user.screen_name +" ⭢ ";
              let mentioned = userdatas[tootipItem.datasetIndex].hovertags[tootipItem.index];
              return ((count > 1) ? count+"* ":"") + poster + mentioned;
            }
          }
        }
      }
    });
    return chart;
  }  


//== RADAR ==
  //TODO: Fix running outa colors etc
  public genTweetTypes(
    ctx: CanvasRenderingContext2D,
    ...summaryData: SummaryData[]
  ) {
    let userdatas: { label: string; data: any[],
      backgroundColor: string}[] = [];
    let tags: string[] = [];
    let keys: string[] = ["Media %", "Mention %", "Link %", "Hashtag %", "Emoji %", "Retweet %", "Pure text %"];

    for(let sd=0; sd<summaryData.length; sd++){
      let sumdat = summaryData[sd];

      //let keys: string[] = ["Media", "Mention", "Link", "Hashtag", "Emoji", "Retweet", "Pure text"];
      //let values: number[] = [];


      let n_media = 0;
      let n_mention = 0;
      let n_url = 0;
      let n_hashtag = 0;
      let n_emoji = 0;
      let n_reweeted = 0;
      let n_text = 0;
      
      for (let i = 0; i < sumdat.tweets.length; i++) {
        let tw = sumdat.tweets[i].tweetData;
        let ent = tw.entities;
        let just_text = true;

        if (tw.hasOwnProperty("extended_entities")){
          n_media++; just_text = false;
        }
        if (ent.user_mentions.length > 0){
          n_mention++; just_text = false;
        }
        if (ent.urls.length > 0){
          n_url++; just_text = false;
        }
        if (ent.hashtags.length > 0){
          n_hashtag++; just_text = false;
        }
        if (extractEmoji(tw.text).length > 0){
          n_emoji++; just_text = false;
        }
        if (tw.hasOwnProperty("retweeted_status")){
          n_reweeted++; just_text = false;
        }
        if (just_text == true){
          n_text++;
        }
      }

      console.log("The "+sumdat.tweets.length+" tweets had: "
          +n_media+ " media\n",
          +n_mention+" mentions\n",
          +n_url+ " links\n"
          +n_hashtag+ " hashtags\n",
          +n_emoji + " emojis\n"
          +n_reweeted + "retweeted\n"
          +n_text + " just text\n"
          );
      let counts = [n_media, n_mention, n_url, n_hashtag, n_emoji, n_reweeted, n_text];
      let values = [];
      counts.forEach(n => {
        values.push((100 * n / sumdat.tweets.length).toFixed(1))
      });


      userdatas.push({ label: sumdat.user.screen_name, data: values, 
          backgroundColor: userColors[sd] });
      }

      let chart = new ChartJS(ctx, {
        type: 'bar',
        data: {labels: keys, datasets: userdatas},
        options: {
          title: { display: true, text: "Tweet content" },
        }
      });
      return chart;
    };

}
