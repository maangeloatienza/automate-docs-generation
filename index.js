const puppeteer = require('puppeteer')
const urls = require('./pages')
const headerTemplate = require('./templates/header')
const footerTemplate = require('./templates/footer')
const excludedSections = `.content-container {background-color:transparent;} #pdf-text-banner { display: none;} #pdf-edit-content{ display: none;} #pdf-footer{ display: none;} #pdf-paginator{ display: none;} #download-pdf-btn{ display:none;} #pdf-popup-banner{ display: none;} #body-wo-popup{ opacity: 100;} .breadcrumbs{ display: none;} #download-modal{ display:none;}  table { width: fit-content; table-layout: fixed;  border-collapse: collapse; } td { word-wrap: break-word; } th { word-wrap: break-word; }`
const duplicates = []
function findDuplicates(arr) {
    const seen = new Set();
    const duplicates = arr.filter(item => {
      if (seen.has(item)) {
        return true;
      }
      seen.add(item);
      return false;
    });
    return duplicates;
}
const printPdf = async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });

    for(const url of urls) {
        console.log(url)
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(180000)
        await page.setViewport({ width: 1920, height: 1080}); 
        await page.goto(url, {waitUntil: 'networkidle2',timeout: 120000 });

        await page.addStyleTag({ content: excludedSections })

        let title = await page.title()
        title = (title).replaceAll("| RAKwireless Documentation Center","")
        title = title.trim()
        title = title.replaceAll(" ","_")
        title = title.replaceAll("/","_")
        console.log("Title: ",title)
        const pdf = await page.pdf({
            path: `./pdf/${title}.pdf`,
            format: 'A4',
            displayHeaderFooter: true,
            printBackground: true,
            headerTemplate,
            footerTemplate,
            margin: {
                top: '80px',
                bottom: '120px',
                left: '20px',
                right: '20px'
            },
            scale: 1,
            title
        });
    }
    await browser.close();
    console.log("DONE")
    console.log("****************************************************")
    console.log("DUPLICATES")
    console.table(findDuplicates(urls))
    console.log("****************************************************")
}


printPdf()