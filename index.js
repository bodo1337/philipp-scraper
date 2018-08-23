var request = require('request');
var fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

//parse DOM
let parseDOM = (html) => {
    let dom = new JSDOM(html);
    element = dom.window.document.querySelectorAll(".channel");
    var list = [];
    element.forEach(function(element) {
    list.push(element.querySelector("a").getAttribute("href"));
    });
    return(list);
}

//gets html
let getURL = (url) => {
    return new Promise(resolve => {
        request(url, function (error, response, body) {
            if(error){
                decline('error:', error);
            }
            if(body){
                resolve(body);
            }
        });
    });
}
//write to file
let writeToCSV = (data) => {
    if (!fs.existsSync("results/")){
        fs.mkdirSync("results/");
    }
    var file = fs.createWriteStream("results/" + Date.now().toString() + ".csv");
    data.forEach((element) => {
        file.write(element + '\n')
    });
    file.end();
}

//returns list with channels
async function getAllChannels (url) {
    let stillResults = true;
    let counter = 1;
    
    let channels = [];

    while(stillResults){
        let html;
        if(counter < 2){
            html = await getURL(url);
        } else {
            html = await getURL(url + "/page:" + counter);
        }
        let result = parseDOM(html);
        //console.log(result);
        if(result.length < 1){
            stillResults = false;
        }else{
            counter++;
            channels = channels.concat(result);
            console.log("Scrapped " + channels.length + " Channels...")
        }       
    }
    //console.log(channels);
    console.log("Writing to CSV...");
    writeToCSV(channels);
    console.log("Saved CSV!");
}
getAllChannels(process.argv[2]);