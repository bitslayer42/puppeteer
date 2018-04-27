const puppeteer = require('puppeteer');
const LogInContracts = require('./LogInContracts'); //has contract info
const LogInEmails = require('./LogInEmails');    //emails
const StoreResultsContracts = require('./StoreResultsContracts'); //has contract info
const StoreResultsEmails = require('./StoreResultsEmails');    //emails

let contractData = [];   //array of aCarData = {"Vin":Vin, "NoContract":null, "Message":null}; 
let emailData = []; //array of anEmailData = {"Vin":Vin,"Rows":[]};
let browser;

async function Run(){  //(called below to start program)
    await process.on('unhandledRejection', errContracts);

    browser = await puppeteer.launch({
        headless: true
    });

    await StoreResultsContracts(null, true); //delete contracts
    await LogInContracts(contractData,browser);

    await process.removeListener('unhandledRejection', errContracts);
    await process.on('unhandledRejection', errEmails);
    
    await StoreResultsEmails(null, true); //delete emails
    await LogInEmails(emailData,browser);

}

Run();

//if any awaits time out, program restarts
async function errContracts (err) {
    console.error(err);
    await StoreResultsContracts(contractData,false);
    contractData = []; 
    await browser.close();
    browser = await puppeteer.launch({
        headless: true
    });
    await LogInContracts(contractData,browser);
}
async function errEmails (err) {
    console.error(err);
    await StoreResultsEmails(emailData,false);
    emailData = []; 
    await browser.close();
    browser = await puppeteer.launch({
        headless: true
    });
    await LogInEmails(emailData,browser);
}
