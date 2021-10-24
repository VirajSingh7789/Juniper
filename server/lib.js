function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function reverse(s) {
  return[...s].reverse().join("");
}

async function generateJSON(company) {
  const path = require('path')
  const {spawn} = require('child_process')

  /*
  var execSync = require('exec-sync');
  var user = execSync('python scrape_websites.py');
  */

  /**
     * Run python myscript, pass in `-u` to not buffer console output
     * @return {ChildProcess}
  */
  function runScript(url){
     return spawn('python', [
        "-u",
        path.join(__dirname, 'scrape_websites.py'),
     "--url", url
     ]);
  }

  const subprocess = runScript(company);

  subprocess.stderr.on('close', () => {
     console.log("Closed");
  });

  return subprocess;
}


const language = require('@google-cloud/language');
const fs = require('fs')

const client = new language.LanguageServiceClient();

let rawdata = fs.readFileSync('articles.json');
var articles = JSON.parse(rawdata);

async function sentimentAnalysis(document) {
    const [result] = await client.analyzeSentiment({document: document});
    const sentiment = result.documentSentiment;

//    console.log(sentiment);

//    console.log(`Sentiment score: ${sentiment.score}`);
//    console.log(`Sentiment magnitude: ${sentiment.magnitude}`);

    return sentiment;
}

async function entityAnalysis(document) {
    const [result1] = await client.analyzeEntities({document: document});
    const entities = result1.entities;

    console.log('Entities:');
    entities.forEach(entity => {
        console.log(entity.name);
        console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
        if (entity.metadata && entity.metadata.wikipedia_url) {
            console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}`);
        }
    })
}

async function classifyCategories(document) {
    const [result2] = await client.classifyText({document: document});
    const categories = result2.categories;

//     console.log('Categories:');
//     categories.forEach(category => {
//         console.log(`Name: ${category.name}, Confidence: ${category.confidence}`);
//     })
    return categories;
}

function getInfo() {
    var header1 = articles["article0"]["header"];
    var header2 = articles["article1"]["header"];
    var url1 = articles["article0"]["url"];
    var url2 = articles["article1"]["url"];
    var info = [header1, url1, header2, url2];
    return info;
}

async function loop() {
    var sentProm = [];
    var sentimentData = [];

    for (var article in articles) {
        var a = articles[article];
        for (var key in a) {
            if (key.match("content")) {
                var k = articles[article][key];
                text = k;

                const document = {
                    content: text,
                    type: 'PLAIN_TEXT',
                };

                sentProm.push(sentimentAnalysis(document));
//                data.push(await sentimentAnalysis(document));
//                data.push(await classifyCategories(document));
            }
        }
    sentimentData = await Promise.all(sentProm);
    }
    return sentimentData;
}

var data = [];
var score = 0;

async function main() {
    loop().then(function(results) {
        data = results;
        for (var key in data) {
            var d = data[key];
            score += d["magnitude"] * d["score"];
        }
        return score;
    });
}

module.exports = {ab2str, generateJSON, loop, getInfo};
