const puppeteer = require('puppeteer');
const LogInContracts = require('./LogInContracts'); //has contract info
const StoreResultsContracts = require('./StoreResultsContracts'); //has contract info
const LogInEmails = require('./LogInEmails');    //emails
const StoreResultsEmails = require('./StoreResultsEmails');    //emails

let contractData = [];   //array of aCarData = {"Vin":Vin, "NoContract":null, "Message":null}; 
let emailData = []; //array of anEmailData = {"Vin":Vin,"Rows":[]};
let browser;

//(called below to start program)
async function Run(){  
    await process.on('unhandledRejection', errHandler);
    await StoreResultsContracts(null, true); //delete contracts
    await StoreResultsEmails(null, true); //delete emails
    
    await RunAll();

}
async function RunAll(){ //Can rerun every time website craps out.    
    browser = await puppeteer.launch({
        headless: true
    });
    await LogInContracts(contractData,browser);
    browser = await puppeteer.launch({
        headless: true
    });
    await LogInEmails(emailData,browser);
}

Run();

//if any awaits time out, program restarts
async function errHandler (err) {
    console.error(err);
    if(contractData.length>0){
        await StoreResultsContracts(contractData,false);
        contractData = []; 
    }
    if(emailData.length>0){
        await StoreResultsEmails(emailData,false);
        emailData = []; 
    }
    await browser.close();
    await RunAll();
}

