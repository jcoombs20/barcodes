function load_page() {
  //***variable to store temp filenames for removal on page unload
  tmpClean = [];

  window.addEventListener("beforeunload", function (e) {
    if(tmpClean.length > 0) {
      $.ajax({
        method: "post",
        url: "http://10.250.148.104:3417/clean",
        data: {"names": tmpClean},
  
        error: function(e) { console.log("AJAX Error: " + e); },
        success: function(result) {
          console.log(result);
        }
      });
    }
  });


  //******Initialize bootstrap tooltip
  $(function() {
    $('[data-toggle="tooltip"]').tooltip();
  });

  $(function () {
    $('[data-toggle="popover"]').popover()
  })

  //******Add header
  d3.select("body")
    .append("div")
    .attr("class", "header")
    .html('<a href="https://www.fws.gov/office/northeast-fishery-center" target="_blank"><img id="usfws" src="images/usfws.png" title="US Fish & Wildlife Service - Northeast Fishery Center" target="_blank"></img></a><div id="headerDiv"><h1>Barcode Label Generator</h1><div class="headerLinks"><p id="intro" class="introLink" title="Click to initiate a walkthrough highlighting the features and functions of the app">Tutorial</p><p id="resources" class="introLink" title="Click to view information pertinent to the app and contact information for questions or comments">Resources</p></div></div><div id="qrDiv"><img id="fws_url" src="images/fws_url.png" title="Scan to visit our webpage!"></img></div>');

  d3.select("#intro").on("click", function() { startIntro(); });
  d3.select("#resources")
    .attr("data-toggle", "modal")
    .attr("data-target", "#resourcesModal");


  //******Add generate
  d3.select("body")
    .append("div")
    .attr("id", "cleanDiv")
    .attr("class", "input")
    .html('<h3>Generate<span id="introI" class="fa fa-info-circle" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p>Specify information and select a template to produce barcode labels for use with lab data flow"></span></h3>'
      + '<form id="protocolForm" action="javascript:;" onsubmit="generate(this)">'
        + '<table id="protocolTable" style="border-collapse:separate;">'
          + '<tr>'
            + '<td colspan="3" style="text-align:left;">'
              + '<button type="reset" id="resetBut" class="formBut btn btn-primary" title="Click to reset the form"><span class="fa fa-repeat"></span> Reset</button>'
            + '</td>'
          + '</tr>'

          + '<tr>'
            + '<td class="labelDiv">Select a lab:</td>'
            + '<td>'
              + '<select id="labSel" class="formInput" name="labSel" required></select>'
            + '</td>'
            + '<td>'
              + '<span class="fa fa-info-circle form" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p>Lab descriptions:<ul><li><b>NEFC</b> - Northeast Fishery Center</li><li><b>WGL</b> - Whitney Genetics Lab</li><ul></p>"></span>'
            + '</td>'
          + '</tr>'

          + '<tr>'
            + '<td class="labelDiv">Select an application:</td>'
            + '<td>'
              + '<select id="appSel" class="formInput" name="appSel" required></select>'
            + '</td>'
            + '<td>'
              + '<span class="fa fa-info-circle form" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p>Application descriptions:<ul><li><b>Tissue (Package)</b> - A label for a single package containing multiple tissue samples, used for logging in receipt of samples</li><li><b>Tissue (Single)</b> - Label(s) for individual tissue samples, used for entering into the tissue database</li><li><b>Extracted DNA</b> - Label(s) for extracted DNA microcentrifuge tube(s)</li><li><b>PCR Product</b> - Label(s) for amplified PCR plate(s)</li><li><b>Pooled DNA</b> - Label(s) for standardized pooled DNA microcentrifuge tube(s)</li><ul></p>"></span>'
            + '</td>'
          + '</tr>'

          + '<tr>'
            + '<td class="labelDiv">Select a year:</td>'
            + '<td>'
              + '<select id="yearSel" class="formInput" name="yearSel" required></select>'
            + '</td>'
            + '<td>'
              + '<span class="fa fa-info-circle form" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p>Year that labels are to be used for (defaults to current year)</p>"></span>'
            + '</td>'
          + '</tr>'

          + '<tr>'
            + '<td class="labelDiv">Select a template:</td>'
            + '<td>'
              + '<select id="tempSel" class="formInput" name="tempSel" required></select>'
            + '</td>'
            + '<td>'
              + '<span class="fa fa-info-circle form" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p>Template descriptions:<ul><li><b>Labtag CL-11</b> - Cryo laser labels, 2.64 x 0.277 inches, 114 per sheet, Part #CL-11</li><li><b>Labtag CL-33</b> - Cryo laser labels, 1.97 x 0.97 inches, 40 per sheet, Part #CL-33</li><li><b>Labtag CL-48</b> - Cryo laser labels, 0.43 inch diameter, 336 per sheet, Part #CL-48T1</li><li><b>Labtag CL-60</b> - Cryo laser labels, 1.122 x 0.96 inch rectangles plus 0.438 inch diameter circles, 40 sets per sheet, Part #CL-60</li><ul></p>"></span>'
            + '</td>'
          + '</tr>'
          
          + '<tr>'
            + '<td>'
              + '<a class="tmpA" href="https://www.labtag.com/shop/product/cryo-laser-labels-2-64-x-0-277-rcl-11-a1-12-assorted-colors/" target="_blank"><img class="tempImg" src="images/labtag_11.jpg" title="Click to view template"></img></a><p class="tempP" value="Labtag CL-11" title="Click to select template" style="position:relative;left:60px;">Labtag CL-11</p>'
            + '</td>'
            + '<td>'
              + '<a class="tmpA" href="https://www.labtag.com/shop/product/cryo-laser-labels-1-97-x-0-97-rcl-33-colors-available/" target="_blank"><img class="tempImg" src="images/labtag_33.jpg" title="Click to view template"></img></a><p class="tempP" value="Labtag CL-33" title="Click to select template">Labtag CL-33</p>'
            + '</td>'
            + '<td>'
              + '<a class="tmpA" href="https://www.labtag.com/shop/product/cryo-laser-labels-0-433-circle-cl-48/" target="_blank"><img class="tempImg" src="images/labtag_48.jpg" title="Click to view template"></img></a><p class="tempP" value="Labtag CL-48" title="Click to select template">Labtag CL-48</p>'
            + '</td>'
            + '<td>'
              + '<a class="tmpA" href="https://www.labtag.com/shop/product/cryo-laser-labels-1-125-x-0-94-0-44-cl-60/" target="_blank"><img class="tempImg" src="images/labtag_60.jpg" title="Click to view template"></img></a><p class="tempP" value="Labtag CL-60" title="Click to select template">Labtag CL-60</p>'
            + '</td>'
          + '</tr>'

          + '<tr>'
            + '<td class="labelDiv">Sheets to print:</td>'
            + '<td>'
              + '<input id="sheetNum" class="formInput" type="number" min="1" value="1" name="sheetNum" required></input>'
            + '</td>'
            + '<td>'
              + '<span class="fa fa-info-circle form" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p>The total number of label sheets to print for the selected template</p>"></span>'
            + '</td>'
          + '</tr>'
          
          + '<tr>'
            + '<td class="labelDiv">Unique counter value:</td>'
            + '<td>'
              + '<input id="counterVal" class="formInput" type="number" min="1" name="counterVal" tabindex="-1" required></input>'
            + '</td>'
            + '<td>'
              + '<span class="fa fa-info-circle form" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p>The current counter value for the lab-application-year combination which forms the text for creation of the barcode. The counter value is the final numbers in the string excluding leading zeros, for example the counter value for NEFC_EXT_2022_000010 is 10. This value must be verified as correct to proceed as this ensures no duplicate barcodes are created. This value will automatically load once selections have been made for lab, application, and year, and will automatically update when the Print button is clicked.</p>"></span>'
            + '</td>'
            + '<td>'
              + '<label style="color:red;margin:0;margin-left:5px;"><input id="counterValMod" class="formInput" type="checkbox" name="counterValMod" disabled title="Check to allow the unique counter value to be changed"></input>Adjust value</label>'
            + '</td>'
          + '</tr>'

          + '<tr>'
            + '<td class="labelDiv">Counter value verified:</td>'
            + '<td>'
              + '<input id="counterVer" class="formInput" type="checkbox" name="counterVer" required title="Check to confirm the unique counter value is correct"></input>'
            + '</td>'
            + '<td>'
              + '<span class="fa fa-info-circle form" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p>Check to verify that the unique counter value is correct. This is necessary to prevent duplication of generated barcodes. Cannot be checked until a lab, application, and year have been selected.</p>"></span>'
            + '</td>'
          + '</tr>'



          + '<tr>'
            + '<td>'
              + '<button type="submit" id="runBut" class="formBut btn btn-primary" title="Click to generate barcode sheets" disabled><span class="fa fa-play-circle"></span> Run</button>'
            + '</td>'
            + '<td>'
              + '<button type="button" id="downloadBut" class="formBut btn btn-primary" title="Click to view and print generated barcode sheets"><a id="downloadA" referrerPolicy="origin" target="_blank" class="dlA stretched-link"><span class="fa fa-print"></span> Print</a></button>'
            + '</td>'
          + '</tr>'
        + '</table>'
        + '<div id="genResults">'
          + '<label class="labelDiv">Sample summary:</label>'
        + '</div>'
      + '</form>'


      + '<div id="prevLabelsDiv">'
        + '<h5 id="prevLabelsH5">Previously created label sheets<span class="fa fa-chevron-down" style="margin-left:10px;color:white;" data-toggle="collapse" data-target="#prevLabelListDiv" title="Click to show/hide previously generated barcode files"></span></h3><span class="fa fa-info-circle" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p>Lists previously generated barcode label sheets ordered by descending creation date. Click the <span class=&quot;fa fa-chevron-down form&quot;></span> to show or hide the list</p>"></span>'
        + '<div id="prevLabelListDiv" class="collapse">'
          + '<ul id="prevLabelsUL"></ul>'
        + '</div>'
      + '</div>'
    );


  $("#protocolForm").on("reset", function() {
    console.log("reset");
    window.setTimeout(function(){
      selCurYear();

      d3.selectAll(".formInput").each(function() {
        if(this.selectedIndex == 0) {
          this.setCustomValidity("An option must be selected");
        }
        else {
          this.setCustomValidity("");
        }
      });
    },0);
  });

  d3.select("#downloadBut")
    .on("click", function() { 
      var tmpData = JSON.parse(d3.select(this).attr("data-json"));
      console.log(tmpData);
      $.ajax({
        method: "POST",
        url: "http://10.250.148.104:3417/update",

        data: tmpData,
        error: function(e) { console.log("AJAX Error: " + e); },
        success: function(result) {
          console.log(result);
          if(result.code == 400) {
            alert(result.msg);
          }
          $("#resetBut").click();
          d3.select("#downloadBut").style("display", "none");
          getFiles();
        }
      });
    });

  $('#prevLabelListDiv').on('shown.bs.collapse', function () {
    window.scrollTo(0, document.body.scrollHeight);
  })


  d3.selectAll(".tempP")
    .on("click", function() {
      var tmpTemp = d3.select(this).attr("value");
      d3.select("#tempSel").selectAll("option").each(function(d,i) {
        if(this.value == tmpTemp) {
          d3.select("#tempSel").property("selectedIndex", i);
          document.getElementById("tempSel").setCustomValidity("");
        }
      });
    });

  d3.select("#counterValMod")
    .on("click", function() {
      if(this.checked == true) {
        var answer = window.confirm("Changing the unique counter value could result in duplicate unique identifiers and their associated barcodes, do you still wish to change the value?");
        if(answer == true) {
          d3.select("#counterVal").style("pointer-events", "all");
        }
        else {
          d3.select(this).property("checked", false);
        }
      }
      else {
        d3.select("#counterVal").style("pointer-events", "none");
      }
    });
      
  d3.select("#counterVer")
    .on("click", function() {
      if(this.checked == true) {
        d3.select("#runBut").property("disabled", false);
      }
      else {
        d3.select("#runBut").property("disabled", true);
      }
    });



  d3.select("#resetBut").on("click", function() { 
    d3.select("#counterVal").attr("value", "");
    d3.select("#counterValMod").property("disabled", true);
    d3.select("#runBut").property("disabled", true);
  });

  document.getElementById("labSel").setCustomValidity("An option must be selected");
  document.getElementById("appSel").setCustomValidity("An option must be selected");
  document.getElementById("yearSel").setCustomValidity("An option must be selected");
  document.getElementById("tempSel").setCustomValidity("An option must be selected");
  document.getElementById("counterVal").setCustomValidity("An option must be selected");

  d3.select("#labSel").selectAll("option")
    .data(["...", "NEFC", "WGL"])
    .enter()
      .append("option")
      .attr("value", function(d) { return d; })
      .text(function(d) { return d; });

  var appVal = ["...", "TIS-P", "TIS-S", "EXT", "PCR", "POOL"];
  d3.select("#appSel").selectAll("option")
    .data(["...", "Tissue (Package)", "Tissue (Single)", "Extracted DNA", "PCR Product", "Pooled DNA"])
    .enter()
      .append("option")
      .attr("value", function(d,i) { return appVal[i]; })
      .text(function(d) { return d; });

  d3.select("#yearSel").selectAll("option")
    .data(["...", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"])
    .enter()
      .append("option")
      .attr("value", function(d) { return d; })
      .text(function(d) { return d; });

  tempCnt = [0, 114, 40, 336, 40];
  d3.select("#tempSel").selectAll("option")
    .data(["...", "Labtag CL-11", "Labtag CL-33", "Labtag CL-48", "Labtag CL-60"])
    .enter()
      .append("option")
      .attr("value", function(d) { return d; })
      .text(function(d) { return d; });



  //***Call when form input is changed
  d3.selectAll(".formInput")
    .on("change", function() {
      d3.select("#downloadBut").style("display", "none");

      if(this.selectedIndex == 0) {
        this.setCustomValidity("An option must be selected");
      }
      else {
        this.setCustomValidity("");
      }

      if(this.id == "labSel" || this.id == "appSel" || this.id == "yearSel") {
        if(d3.select("#counterValMod").property("checked") == true) {
          $("#counterValMod").click();
        }
      }

      if((d3.select("#labSel").property("selectedIndex") > 0 && d3.select("#appSel").property("selectedIndex") > 0 && d3.select("#yearSel").property("selectedIndex") > 0) && d3.select("#counterValMod").property("checked") == false) {
        d3.json("files/qrcodes_unique_counts.json").then(function(counts) {
          var tmpForm = document.getElementById("protocolForm");
          d3.select("#counterVal").property("value", counts[tmpForm.labSel.value][tmpForm.appSel.value][tmpForm.yearSel.value]);
          document.getElementById("counterVal").setCustomValidity("");
          d3.select("#counterValMod").property("disabled", false);
        });
      }
      else if((d3.select("#labSel").property("selectedIndex") == 0 || d3.select("#appSel").property("selectedIndex") == 0 || d3.select("#yearSel").property("selectedIndex") == 0) && d3.select("#counterValMod").property("checked") == false) {
        d3.select("#counterVal").property("value", "");
        document.getElementById("counterVal").setCustomValidity("An option must be selected");
        d3.select("#counterValMod").property("disabled", true);
        if(d3.select("#counterVer").property("checked") == true) {
          $("#counterVer").click();
        }
      }
    });

    selCurYear();

  function selCurYear() {
    var year = new Date().getFullYear();
    d3.select("#yearSel").selectAll("option").each(function(d,i) {
      if(this.value == year) {
        d3.select("#yearSel").property("selectedIndex", i);
        document.getElementById("yearSel").setCustomValidity("");
      }
    });
  }




  //******Add Resources
  d3.select("body")
    .append("div")
    .attr("class", "modal fade ui-draggable in ")
    .attr("id", "resourcesModal")
    .style("display", "none")
    .append("div")
    .attr("class", "modal-dialog modal-lg")
    .attr("id", "resourcesDiv")
    .html('<h3>Resources<span id="modalExit" class="fa fa-times-circle" title="Click to close resources window"></span></h3>'
      + '<hr>'
      + '<div id="resourceInternalDiv">'
        + '<h5>Barcodes<span class="fa fa-info-circle" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p>Links to information about barcodes used by this app.</p>"></span></h5>'
        + '<div id="docDiv" class="resLinkDiv">'
          + '<a class="resourceA" href="https://barcode-labels.com/getting-started/barcodes/types/" target="_blank" title="Click to view an overview of barcode types"><span class="fa fa-link faResource"</span></a><p class="resourceP">Overview of barcode types</p>'
          + '<br>'
          + '<a class="resourceA" href="https://github.com/soldair/node-qrcode" target="_blank" title="Click to view node-qrcode github page"><span class="fa fa-link faResource"</span></a><p class="resourceP">Node-qrcode</p>'
          + '<br>'
          + '<a class="resourceA" href="https://github.com/metafloor/bwip-js" target="_blank" title="Click to view bwip-js github page"><span class="fa fa-link faResource"</span></a><p class="resourceP">Bwip-js</p>'
          + '<br>'
          + '<a class="resourceA" href="https://community.esri.com/t5/arcgis-survey123-blog/understanding-barcode-questions-in-arcgis/ba-p/895156" target="_blank" title="Click to view information on using barcodes with Survey123"><span class="fa fa-link faResource"</span></a><p class="resourceP">Barcode use in Survey123</p>'
        + '</div>'
        + '<br><br>'
        + '<h5>Contact Information<span class="fa fa-info-circle" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p>Email addresses for questions and comments about protocols and the app .</p>"></span></h5>'
        + '<div id="emailDiv" class="resLinkDiv">'
          //+ '<a class="resourceA" href="mailto:aaron_maloy@fws.gov?subject=Mitogenome Assembly Protocol" target="_blank" title="Click to send email"><span class="fa fa-envelope faResource"</span></a><p class="resourceP">Mitogenome assembly protocol questions: <span class="emailSpan">Aaron Maloy - <a href="mailto:aaron_maloy@fws.gov?subject=Mitogenome Assembly Protocol" target="_blank" title="Click to send email">aaron_maloy@fws.gov</a></span></p>'
          //+ '<br>' 
          + '<a class="resourceA" href="mailto:jason_coombs@fws.gov?subject=Data flow QR Code" target="_blank" title="Click to send email"><span class="fa fa-envelope faResource"</span></a><p class="resourceP">QR code or lab data flow questions: <span class="emailSpan">Jason Coombs - <a href="mailto:jason_coombs@fws.gov?subject=OpenTrons Protocol Creation" target="_blank" title="Click to send email">jason_coombs@fws.gov</a></span></a></p>'
        + '</div>'
      + '</div>'
    );
  
  d3.select("#modalExit")
    .attr("data-toggle", "modal")
    .attr("data-target", "#resourcesModal");

  //***Get previously printed label files
  getFiles();

}



//******Get previously printed files
function getFiles() {
  $.ajax({
    method: "POST",
    url: "http://10.250.148.104:3417/files",
    //data: tmpData,
    error: function(e) { console.log("AJAX Error: " + e); },
    success: function(result) {
      //console.log(result); 
      d3.select("#prevLabelsUL").selectAll("li").remove();

      d3.select("#prevLabelsUL").selectAll("li")
        .data(result.files)
        .enter()
          .append("li")
          .html(function(d, i) { return '<div class="fileNameDiv"><a href="labels/' + d + '" target="_blank">' + d + '</a></div><div class="fileDateDiv">' + result.times[i] + '</div>'; });
    }
  });
}



//******Generate barcode labels
function generate(tmpForm) {
  var lab = tmpForm.labSel.value;
  var app = tmpForm.appSel.value;
  var year = tmpForm.yearSel.value;
  var template = tmpForm.tempSel.value;
  var sheets = tmpForm.sheetNum.value;
  var counter = tmpForm.counterVal.value
  var labels = tempCnt[d3.select("#tempSel").property("selectedIndex")];

  console.log(lab);
  console.log(app);
  console.log(year);
  console.log(template);
  console.log(sheets);
  console.log(counter);
  console.log(labels);

  tmpData = {"lab": lab, "app": app, "year": year, "template": template, "sheets": sheets, "counter": counter, "labels": labels};

  //Generate QR codes, add them to PDF according to selected template, and return PDF 
  $.ajax({
    method: "POST",
    url: "http://10.250.148.104:3417/run",

    data: tmpData,
    error: function(e) { console.log("AJAX Error: " + e); },
    success: function(result) {
      console.log(result); 
      d3.select("#downloadA").attr("href", result.url);
      d3.select("#downloadBut")
        .attr("data-json", JSON.stringify(result))
        .style("display", "inline-block");
      if(tmpClean.indexOf(result.url) < 0) {
        tmpClean.push(result.url);
      }
    }
  });

}











//******Tutorial
function startIntro() {
  var intro = introJs();
  intro.setOptions({
    steps: [
      //0
      { intro: '<b>Welcome to the <span style="font-family:nebulous;color:orangered;font-weight:bold;">Barcode Label Generator</span> app!</b><img src="images/fws_url.png" style="height:75px;display:block;margin:auto;"></img>This app is designed to generate custom barcodes for use with Survey123 data collection apps for lab data work flow.' },
      //1
      { element: document.querySelector("#intro"), intro: "To access this guide at any time simply click on the 'Tutorial' link." },
      //2
      { element: document.querySelector("#resources"), intro: "Click here for:<ul><li>An overview of barcode types</li><li>Information on the NodeJS barcode creator packages</li><li>Using barcodes with Survey123</li><li>Contact information to address questions or comments about the app</li></ul>" },
      //3
      { element: document.querySelector("#introI"), intro: 'Hover the cursor over any <span class="fa fa-info-circle" style="margin:0;"></span> icon to view information about the associated element.' },
      //4
      { intro: "Complete the form selections to provide the information necessary for generation of the unique identifiers and their associated barcodes." },
      //5
      { element: document.querySelector("#labSel"), intro: "Select the appropriate lab." },
      //6
      { element: document.querySelector("#appSel"), intro: "Choose the application for which the labels will be used."},
      //7
      { element: document.querySelector("#yearSel"), intro: "Select the desired year (defaults to current year)." },
      //8
      { element: document.querySelector("#tempSel"), intro: "Choose the appropriate label template. Click on a template image to learn more about it." },
      //9
      { element: document.querySelector("#sheetNum"), intro: "Specify the number of label sheets you wish to generate." },
      //10
      { element: document.querySelector("#counterVal"), intro: "View the current counter value for the Lab-Application-Year combination. This value is critical as it is the component that creates the unique identifier." },
      //11
      { element: document.querySelector("#counterValMod"), intro: 'If for some reason the counter value needs to be changed, check this box to enable value adjustment. Doing so will generate a warning message as setting the counter value to one that has been previously used will result in duplicate unique identifiers and barcodes.' },
      //12
      { element: document.querySelector("#counterVer"), intro: "Check the box to confirm that the counter value is correct. Once checked, the Run button will be able to be clicked." },
      //13
      { element: document.querySelector("#runBut"), intro: "Click to generate the barcode label sheets." },
      //14
      { element: document.querySelector("#downloadBut"), intro: "Click to view and print the generated label sheets. When clicked, a copy of the newly generated label sheet is permanently saved to the server and the counter value for the Lap-App-Year combination is updated." },
      //15
      { element: document.querySelector("#prevLabelsDiv"), intro: "Expand this list to view and, if necessary, reprint previously created barcode label sheets." },
      //16
      { intro: 'Thank you for touring the <span style="font-family:nebulous;color:orangered;font-weight:bold;">Barcode Label Generator</span> app!<img src="images/pdf417.png" style="display:block;margin:auto;padding:10px;"></img>Questions or comments can be directed to <a href="mailto:jason_coombs@fws.gov?subject=OpenTrons Protocol App" target="_blank">Jason Coombs</a>.' },
    ],
    tooltipPosition: 'auto',
    positionPrecedence: ['right', 'left', 'bottom', 'top'],
    showStepNumbers: false,
    hidePrev: true,
    hideNext: true,
    scrollToElement: true,
    disableInteraction: true,
  });

  intro.onchange(function() { 
    revertIntro();
    switch (this._currentStep) {
      case 0:
        break;
      case 1:
        d3.select("#intro").style("color","aqua");
        d3.select(".header").classed("highZ", true);
        break;
      case 2:
        d3.select("#resources").style("color","aqua");
        d3.select(".header").classed("highZ", true);
        break;
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
        break
      case 14:
        d3.select("#downloadBut").style("display", "inline-block");
        break;
      case 15:
        d3.select("#prevLabelListDiv").classed("show", true);
        break;
      case 16:
        break;
    }
  });

  intro.onbeforechange(function() { 
    switch (this._currentStep) {
      case 16:                              
        break;
    }  
  });

  intro.oncomplete(function() { 
    //localStorage.setItem('doneTour', 'yeah!'); 
    $("#clean").click();
    d3.select("#introResultsDiv").remove();
    revertIntro();
  });

  intro.onexit(function() {
    $("#clean").click();
    d3.select("#introResultsDiv").remove();
    revertIntro();
    //disableTutorialSession = true;
  });            


  intro.start();



  function revertIntro() {
    d3.selectAll("#intro,#resources").style("color", "");
    d3.select("#downloadBut").style("display", "none");
    d3.select("#prevLabelListDiv").classed("show", false);
    d3.select(".header").classed("highZ", false);
    $("#resetBut").click();
  }

}




