import { SummaryData } from "./panels/summary_panel";
import { NaturalLanguageProcessingAPI, NLPEntityData } from "./nlp";




export class ChartGen {
    public tweetGraph(data : NLPEntityData){
        console.log("Lang: "+data.language);
        data.entities.forEach(element => {
            console.log("Ent "+element.name+"'s score: "+element.sentiment.score)
        });
    }   
}