const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var QRCode = require('qrcode');
const fs = require('fs');
const cheerio = require('cheerio');
const bwipjs = require('bwip-js');

app.listen(3417);

console.log("Running on 3417...");

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', function(req, res) { 
  res.send("Listening for calls"); 
});

app.get('/run', function(req, res) {
  res.send("Ready to run");
});

app.post('/clean', function(req, res) {
  var data = req.body;
  //console.log(data);
  data.names.forEach(function(name) {
    fs.unlink(__dirname + "/" + name, function(err) {
      if(err) {
        console.log(err);
      }
      else {
        //console.log("Removed " + name);
      }
    });
  });

  res.send("Temp directory cleaned");
});


app.post('/update', function(req, res) {
  var data = req.body;
  //console.log(data);

  fs.readFile(__dirname + "/files/qrcodes_unique_counts.json", function(err, file) {
    if(err) {
      console.log(err);
    }
    else {
      var tmpJSON = JSON.parse(file);
      //***counter value updated
      if(parseInt(data.nextLabel) > parseInt(tmpJSON[data.lab][data.app][data.year])) {
        tmpJSON[data.lab][data.app][data.year] = data.nextLabel;
        fs.writeFile(__dirname + "/files/qrcodes_unique_counts.json", JSON.stringify(tmpJSON), function(err) {
          if(err) {
            console.log(err);
          }
          else {
            var newFile = data.url.replace("temp", "labels");
            fs.copyFile(__dirname + "/" + data.url, __dirname + "/" + newFile, function(err) {
              if(err) {
                console.log(err);
              }
              else {
                res.send({"url": newFile, "code": 200});
              }
            });
          }
        });
      }
      //***Counter value not updated
      else {
        var newFile = data.url.replace("temp", "labels");
        fs.copyFile(__dirname + "/" + data.url, __dirname + "/" + newFile, function(err) {
          if(err) {
            console.log(err);
          }
          else {
            res.send({"code": 400, "msg": "The updated counter value was lower than the stored counter value, so in order to avoid duplicate labels the value was not updated."}); 
          }
        });
      }
    }
  });
});


app.post('/files', function(req, res) {
  var tmpTimes = [];
  fs.readdir(__dirname + "/labels", function(err, files) {
    if(err) {
      console.log(err);
    }
    else {
      files = files.map(function (fileName) {
        return {
          name: fileName,
          time: fs.statSync(__dirname + "/labels/" + fileName).mtime.getTime()
        };
      })
      .sort(function (a, b) {
        return b.time - a.time; })
      .map(function (v) {
        return v.name; });

      files.forEach(function(file) {
        var tmpStats = fs.statSync(__dirname + "/labels/" + file);
        tmpTimes.push(tmpStats.birthtime.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      });

      res.send({"files": files, "times": tmpTimes});
    }
  });
});


app.post('/run', function(req, res) {
  var data = req.body;
  //console.log(data);

  var opts1 = "";
  var opts2 = "";
  var tmpHTML = {};
  var $ = "";
  var idArr = [];
  var tmpQR = data.lab + "_" + data.app + "_" + data.year + "_";
  var urlArr = [];
  var urlArr1 = [];
  var urlArr2 = [];
  var k_cb = 0;

  switch(data.template) {
    //******PCR plate label
    case "Labtag CL-11":
      opts1 = {
        bcid: "pdf417",
        text: "testing",
        columns: 8,
        scale: 1,
        bacrgroundcolor:"#FFFFFF",
        rowmult: 2
      }

      tmpHTML.style = ''
        + 'body {'
          + 'font-family: "Roboto", sans-serif;'
          + 'height: 11.0in;'
          + 'width: 8.5in;'
          + 'margin: 0;'
        + '}'

        + '.pageDiv {'
          + 'height: 11.0in;'
          + 'width: 8.5in;'
          + 'overflow: hidden;'
          + 'padding-top: 0.24in;'
          + 'padding-left: 0.22in;'
          + 'padding-right: 0.22in;'
        + '}'

        + 'table {'
          + 'width: 7.92in;'
          + 'height: 10.526in;'
          + 'border-collapse: collapse;'
          + 'border: none;'
        + '}'

        + 'tr.labelTR {'
          + 'height: 0.277in;'
        + '}'

        + 'td.labelTD {'
          + 'vertical-align: top;'
          + 'width: 2.64in;'
          + 'height: 0.277in;'
          + 'padding: 0;'
          + 'padding-left: 0.1in;'
          + 'padding-right: 0.1in;'
          + 'border: 1px solid black;'
        + '}'

        + 'tr.spacerTR {'
          + 'height: 0.0in;'
        + '}'

        + 'td.spacerTD {'
          + 'width: 0.0in;'
          + 'height: 0.0in;'
          + 'padding: 0;'
        + '}'

        + '@media print {'
          + 'td.labelTD {'
            + 'border: none;'
          + '}'

          + '.pageDiv {'
            + 'page-break-after: always;'
          + '}'
        + '}'
     
      tmpHTML.labRows = 38;
      tmpHTML.labCols = 3;
      tmpHTML.spacerRows = 0;
      tmpHTML.spacerCols = 0;
 
      tmpHTML.table = makeTable();
      tmpHTML.html = makeHTML();

      $ = cheerio.load(tmpHTML.html);
      makeQR("bwip-js");
      break;

    //******Tissue package label
    case "Labtag CL-33":   
      opts1 = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        scale: 2,
        margin: 1,
        color: {
          dark:"#000000FF",
          light:"#FFFFFFFF"
        }
      }

      tmpHTML.style = ''
        + 'body {'
          + 'font-family: "Roboto", sans-serif;'
          + 'height: 11.0in;'
          + 'width: 8.5in;'
          + 'margin: 0;'
        + '}'

        + '.pageDiv {'
          + 'height: 11.0in;'
          + 'width: 8.5in;'
          + 'overflow: hidden;'
          + 'padding-top: 0.29in;'
          + 'padding-left: 0.31in;'
          + 'padding-right: 0.31in;'
        + '}'

        + 'table {'
          + 'width: 7.88in;'
          + 'height: 10.42in;'
          + 'border-collapse: collapse;'
          + 'border: none;'
        + '}'

        + 'tr.labelTR {'
          + 'height: 0.97in;'
        + '}'

        + 'td.labelTD {'
          + 'width: 1.97in;'
          + 'height: 0.97in;'
          + 'padding-left: 0.1in;'
          + 'padding-right: 0.1in;'
          + 'border: 1px solid black;'
        + '}'

        + 'tr.spacerTR {'
          + 'height: 0.08in;'
        + '}'

        + 'td.spacerTD {'
          + 'width: 1.97in;'
          + 'height: 0.08in;'
          + 'padding: 0;'
        + '}'

        + '@media print {'
          + 'td.labelTD {'
            + 'border: none;'
          + '}'

          + '.pageDiv {'
            + 'page-break-after: always;'
          + '}'
        + '}'
     
      tmpHTML.labRows = 10;
      tmpHTML.labCols = 4;
      tmpHTML.spacerRows = 9;
      tmpHTML.spacerCols = 4;
 
      tmpHTML.table = makeTable();
      tmpHTML.html = makeHTML();

      $ = cheerio.load(tmpHTML.html);
      makeQR("qrcode");
      break;
    
    //******Microcentrifuge tube cap labels
    case "Labtag CL-48":
      opts1 = {
        errorCorrectionLevel: 'Q',
        type: 'image/png',
        scale: 1,
        margin: 1,
        color: {
          dark:"#000000FF",
          light:"#FFFFFFFF"
        }
      }

      tmpHTML.style = ''
        + 'body {'
          + 'font-family: "Roboto", sans-serif;'
          + 'height: 11.0in;'
          + 'width: 8.5in;'
          + 'margin: 0;'
        + '}'

        + '.pageDiv {'
          + 'height: 11.0in;'
          + 'width: 8.5in;'
          + 'overflow: hidden;'
          + 'padding-top: 0.37in;'
          + 'padding-left: 0.33in;'
          + 'padding-right: 0;'
        + '}'

        + 'table {'
          + 'width: 8.2in;'
          + 'height: 10.3404in;'
          + 'border-collapse: collapse;'
          + 'border: none;'
        + '}'

        + 'tr.labelTR {'
          + 'height: 0.4924in;'
        + '}'

        + 'td.labelTD {'
          + 'width: 0.4924in;'
          + 'height: 0.4924in;'
          + 'padding: 0;'
          + 'padding-left: 0.01in;'
          + 'padding-right: 0.01in;'
          + 'border: 1px solid black;'
        + '}'

        + 'tr.spacerTR {'
          + 'height: 0.0in;'
        + '}'

        + 'td.spacerTD {'
          + 'width: 0.0in;'
          + 'height: 0.0in;'
          + 'padding: 0;'
        + '}'

        + '.capDiv {'
          + 'border: 1px solid black;'
          + 'border-radius: 25px;'
          + 'width: 0.43in;'
          + 'height: 0.43in;'
          + 'display: flex;'
          + 'align-items: center;'
          + 'align-content: center;'
          + 'justify-content: center;'
        + '}'

        + '@media print {'
          + 'td.labelTD {'
            + 'border: none;'
          + '}'

          + '.capDiv {'
            + 'border: none;'
          + '}'

          + '.pageDiv {'
            + 'page-break-after: always;'
          + '}'
        + '}'
     
      tmpHTML.labRows = 21;
      tmpHTML.labCols = 16;
      tmpHTML.spacerRows = 0;
      tmpHTML.spacerCols = 0;
 
      tmpHTML.table = makeTable();
      tmpHTML.html = makeHTML();

      $ = cheerio.load(tmpHTML.html);
      makeQR("qrcode");
      break;

    //******Microcentrifuge side & cap label pair
    case "Labtag CL-60":
      opts1 = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        scale: 1,
        margin: 1,
        color: {
          dark:"#000000FF",
          light:"#FFFFFFFF"
        }
      }

      opts2 = {
        errorCorrectionLevel: 'Q',
        type: 'image/png',
        scale: 1,
        margin: 1,
        color: {
          dark:"#000000FF",
          light:"#FFFFFFFF"
        }
      }

      tmpHTML.style = ''
        + 'body {'
          + 'font-family: "Roboto", sans-serif;'
          + 'height: 11.0in;'
          + 'width: 8.5in;'
          + 'margin: 0;'
        + '}'

        + '.pageDiv {'
          + 'height: 11.0in;'
          + 'width: 8.5in;'
          + 'overflow: hidden;'
          + 'padding-top: 0.29in;'
          + 'padding-left: 0.31in;'
          + 'padding-right: 0.0in;'
        + '}'

        + 'table {'
          + 'width: 7.88in;'
          + 'height: 10.42in;'
          + 'border-collapse: collapse;'
          + 'border: none;'
        + '}'

        + 'tr.labelTR {'
          + 'height: 0.96in;'
        + '}'

        + 'td.labelTD1 {'
          + 'width: 1.122in;'
          + 'height: 0.96in;'
          + 'padding-left: 0.1in;'
          + 'padding-right: 0.1in;'
          + 'border: 1px solid black;'
        + '}'

        + 'td.labelTD2 {'
          + 'width: 0.438in;'
          + 'height: 0.438in;'
          + 'padding: 0;'
        + '}'

        + '.capDiv {'
          + 'border: 1px solid black;'
          + 'border-radius: 25px;'
          + 'width: 0.43in;'
          + 'height: 0.43in;'
          + 'display: flex;'
          + 'align-items: center;'
          + 'align-content: center;'
          + 'justify-content: center;'
        + '}'

        + '@media print {'
          + 'td.labelTD1 {'
            + 'border: none;'
          + '}'

          + '.capDiv {'
            + 'border: none;'
          + '}'

          + '.pageDiv {'
            + 'page-break-after: always;'
          + '}'
        + '}'
     
      tmpHTML.labRows = 10;
      tmpHTML.labCols = 8;
      tmpHTML.spacerRows = 0;
      tmpHTML.spacerCols = 0;
 
      tmpHTML.table = makeTableMixed();
      tmpHTML.html = makeHTML();

      $ = cheerio.load(tmpHTML.html);
      makeQR("qrcode1");
      break;
  }



  function makeHTML() {
    var html = '<!doctype html>'
      + '<html>'
        + '<head>'
          + '<style>'
            + tmpHTML.style
          + '</style>'
        + '</head>'
        + '<body>'
          + tmpHTML.table
        + '</body>'
      + '</html>'
    return html;
  }


  function makeTable() {
    var spacerCnt = 0;
    var tmpTable = "";
    for(c = 0; c < parseInt(data.sheets); c++) {
      tmpTable += '<div class="pageDiv"><table id="labelTable' + c + '"><tbody>'
      for(a = 0; a < tmpHTML.labRows; a++) {
        //***Label TR
        tmpTable += '<tr class="labelTR">';
        for(b = 0; b < tmpHTML.labCols; b++) {
          tmpTable += '<td class="labelTD"></td>';
        }
        tmpTable += '</tr>'

        if(spacerCnt < tmpHTML.spacerRows) {
          spacerCnt += 1;
          //***Label TR
          tmpTable += '<tr class="spacerTR">';
          for(b = 0; b < tmpHTML.spacerCols; b++) {
            tmpTable += '<td class="spacerTD"></td>';
          }
          tmpTable += '</tr>'
        } 
      }    
      tmpTable += '</tbody></table></div>'
      spacerCnt = 0;
    }
    return tmpTable;
  }

  function makeTableMixed() {
    var spacerCnt = 0;
    var tmpTable = "";
    for(c = 0; c < parseInt(data.sheets); c++) {
      tmpTable += '<div class="pageDiv"><table id="labelTable' + c + '"><tbody>'
      for(a = 0; a < tmpHTML.labRows; a++) {
        //***Label TR
        tmpTable += '<tr class="labelTR">';
        for(b = 0; b < tmpHTML.labCols; b++) {
          if(b%2 == 0) {
            tmpTable += '<td class="labelTD1"></td>';
          }
          else {
            tmpTable += '<td class="labelTD2"></td>';
          }
        }
        tmpTable += '</tr>'

        if(spacerCnt < tmpHTML.spacerRows) {
          spacerCnt += 1;
          //***Label TR
          tmpTable += '<tr class="spacerTR">';
          for(b = 0; b < tmpHTML.spacerCols; b++) {
            tmpTable += '<td class="spacerTD"></td>';
          }
          tmpTable += '</tr>'
        } 
      }    
      tmpTable += '</tbody></table></div>'
      spacerCnt = 0;
    }
    return tmpTable;
  }


  function makeQR(format) {
    for(let j = parseInt(data.counter); j < (parseInt(data.counter) + (parseInt(data.labels) * parseInt(data.sheets))); j++) {
      var tmpCnt = makeCnt(j.toString());
      idArr.push(tmpQR + tmpCnt);
    }

    idArr.forEach(function(tmpQR,k) {
      if(format.includes("qrcode")) {
        if(format == "qrcode2") {
          var tmpOpts = opts2;
        }
        else {
          var tmpOpts = opts1;
        }
        QRCode.toDataURL(tmpQR, tmpOpts, function(err, url) {
          if(err) {
            console.log(err);
          }
          else {
            urlArr[idArr.indexOf(tmpQR)] = url;
            k_cb += 1;
            if(k_cb == idArr.length && format == "qrcode") {                
              makePDF();
            }
            else if(k_cb == idArr.length && format == "qrcode1") {
              urlArr1 = [...urlArr]
              makeQR("qrcode2");
            }
            else if(k_cb == idArr.length && format == "qrcode2") {
              urlArr2 = [...urlArr];
              makePDF();
            }
          }
        });
      }
      else if(format == "bwip-js") { 
        opts1.text = tmpQR;
        bwipjs.toBuffer( opts1, function(err, url) {
          if(err) {
            console.log(err);
          }
          else {
            urlArr[idArr.indexOf(tmpQR)] = 'data:image/png;base64, ' + url.toString('base64');
            k_cb += 1;
            if(k_cb == idArr.length) {
              makePDF();
            }
          }
        });
      }
    });
  }

  function makePDF() {
    var n = 0;
    var tmpDate = new Date().toLocaleDateString();
    switch(data.template) {
      case "Labtag CL-33":   //Tissue package label
        $(".labelTR").each(function(index,tr) {
          $(tr).find("td").each(function(index,td) {
            //$(td).html('<img src="' + urlArr[n] + '" style="margin:0;"></img><p style="font-size:7px;margin:0">' + idArr[n] + '<span style="float:right;">' + tmpDate + '</span></p>');
            $(td).html('<img src="' + urlArr[n] + '" style="margin:0;"></img><p style="font-size:7px;margin:0">' + idArr[n] + '</p>');
            n += 1;
          });
        });
        break;
      case "Labtag CL-11":   //PCR plate label
        $(".labelTR").each(function(index,tr) {
          $(tr).find("td").each(function(index,td) {
            $(td).html('<img src="' + urlArr[n] + '" style="margin:0;"></img><p style="font-size:6px;margin:0">' + idArr[n] + '</p>');
            n += 1;
          });
        });
        break;
      case "Labtag CL-48":   //Microcentrifuge tube cap label
        $(".labelTR").each(function(index,tr) {
          $(tr).find("td").each(function(index,td) {
            $(td).html('<div class="capDiv"><img src="' + urlArr[n] + '" style="margin:0;"></img>');
            n += 1;
          });
        });
        break;
      case "Labtag CL-60":   //Microcentrifuge tube side and cap label pair
        $(".labelTR").each(function(index,tr) {
          $(tr).find("td").each(function(index,td) {
            if(index%2 == 0) {
              $(td).html('<img src="' + urlArr1[n] + '" style="margin:0;"></img><p style="font-size:7px;margin:0">' + idArr[n] + '</p>');
            }
            else {
              $(td).html('<div class="capDiv"><img src="' + urlArr2[n] + '" style="margin:0;"></img>');
              n += 1;
            }
          });
        });
        break;
    }

    var html = $.html();
    var lastLabel = parseInt(data.counter) + ((data.labels * data.sheets) - 1);
    var tmpFile = "temp/" + tmpQR + data.counter + "-" + lastLabel + ".html";
     
    fs.writeFile(__dirname + "/" + tmpFile, html, function(err) {
      if(err) {
        console.log(err);
      }
      else {
        res.send({"url": tmpFile, "nextLabel": lastLabel + 1, "lab": data.lab, "app": data.app, "year": data.year});
      }
    });       
  }

  function makeCnt(cnt) {
    var tmpCnt = "";
    for(let i = 0; i < (6 - cnt.length); i++) {
      tmpCnt += "0";
    }
    tmpCnt += cnt;
    return tmpCnt;
  }

});
