let PDFJS = require('pdfjs-dist');

// Based on https://stackoverflow.com/a/20522307/3791179.
// A version of this code is added as an answer as well.

/**
 *
 * @param path Path to the pdf file.
 * @param callbackPageDone To inform the progress each time
 *        when a page is finished. The callback function's input parameters are:
 *        1) number of pages done.
 *        2) total number of pages in file.
 *        3) the `page` object itself or null.
 * @param callbackAllDone Called after all text has been collected. Input parameters:
 *        1) full text of parsed pdf.
 *
 * Note: This can definitely be refactored.
 *
 * @returns The full text of the PDF with some kind of whitespace added.
 * 
 */
let pdfToText = async function (paths, callbackPageDone, callbackAllDone) {

  for (let path of paths) {

    console.log('PDF Path:', path);
    let numPagesComplete = 0;

    let pdf = await PDFJS.getDocument(path).promise;

    let total = pdf.numPages;
    callbackPageDone(0, total, null);

    let pages = {};
    // For some (pdf?) reason these don't all come in consecutive
    // order. That's why they're stored as an object and then
    // processed one final time at the end.
    for (let pagei = 1; pagei <= total; pagei++) {

      let page = await pdf.getPage(pagei)
      let pageNumber = page.pageNumber;

      let textContent = await page.getTextContent()
      if (null != textContent.items) {
        let page_text = "";
        let last_item = null;
        for (let itemsi = 0; itemsi < textContent.items.length; itemsi++) {
          let item = textContent.items[itemsi];
            // I think to add whitespace properly would be more complex and
            // would require two loops.
            if (last_item != null && last_item.str[last_item.str.length - 1] != ' ') {
              let itemX = item.transform[5]
              let lastItemX = last_item.transform[5]
              let itemY = item.transform[4]
              let lastItemY = last_item.transform[4]
              if (itemX < lastItemX)
                page_text += "\r\n";
              else if (itemY != lastItemY && (last_item.str.match(/^(\s?[a-zA-Z])$|^(.+\s[a-zA-Z])$/) == null))
                page_text += ' ';
            }  // ends if may need to add whitespace

          page_text += item.str;
          last_item = item;
        }  // ends for every item of text

        pages[pageNumber] = page_text + "\n\n";
      }  // ends if has items

      ++numPagesComplete;
      callbackPageDone(numPagesComplete, total, page);

    }  // ends for every page


    // If all done, put pages in order and combine all
    // text, then pass that to the callback
    let full_text = "";
    let num_pages = Object.keys(pages).length;
    for (let pageNum = 1; pageNum <= num_pages; pageNum++) {
      full_text += pages[pageNum];
    }
    callbackAllDone(full_text);

  }  // ends for each file path
};  // Ends pdfToText()

module.exports = { pdfToText };
