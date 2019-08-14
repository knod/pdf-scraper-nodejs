// index.js

// An example
// Run in command prompt from root folder with:
// node index.js

// IMPORTS
const {pdfToText} = require('./pdfToText.js');


// CODE

// Change this to whatever filepath you want
let pathToPDFs = [
  'data-cpCP-67-CR-0008224-2015-docket.pdf',
  'data-cpCP-67-CR-0008224-2015-summary.pdf'
];

let onPageDone = function () {};  // don't want to do anything between pages
let onFinish = function(fullText){
  console.log(fullText);
};

pdfToText(pathToPDFs, onPageDone, onFinish);
