import { SummaryData } from "./panels/summary_panel";
import { NaturalLanguageProcessingAPI, NLPEntityData } from "./nlp";

import * as ChartJS from "chart.js"


export class ChartGen {
    public tweetGraph(data : NLPEntityData, ctx : CanvasRenderingContext2D){
        console.log("Lang: "+data.language);
        data.entities.forEach(element => {
            console.log("Ent "+element.name+"'s score: "+element.sentiment.score)
        });
        let myChart = new ChartJS(ctx, {
            type: 'pie',
            data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [{
                    label: '# of Votes',
                    data: [1, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }   
}