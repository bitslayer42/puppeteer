const puppeteer = require('puppeteer');
const CREDS = require('./creds');
// var Request = require('tedious').Request;  
// var TYPES = require('tedious').TYPES;  
// var Connection = require('tedious').Connection;  

const aVin = '1C3CCCFB8GN194471'; //'2C4RC1GG3JR100527'; //2A8HR54199R612914


async function run(aVin) {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    const result = await page.evaluate((x,y) => {
        return Promise.resolve(y * x);
      }, 7, 7);
      console.log(result); // prints "56"

    // browser.close();
}

run(aVin);

//if any awaits time out, program ends
process.on('unhandledRejection', (err) => { 
    console.error(err)
    process.exit(1)
  })