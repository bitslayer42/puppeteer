const puppeteer = require('puppeteer');
const CREDS = require('./creds');
var Request = require('tedious').Request;  
var TYPES = require('tedious').TYPES;  

var Connection = require('tedious').Connection;  


//Login
const USERNAME_SELECTOR = '#FormsEditField1';
const PASSWORD_SELECTOR = '#FormsEditField2';
const BUTTON_SELECTOR = '#userFields > ul > li:nth-child(3) > input';

//Vin lookup
const VIN_SELECTOR = '#VINLastEight';
const aVin = '2C4RC1GG3JR100527'; //'1C3CCCFB8GN194471'; //2A8HR54199R612914
const VIN_BUTTON_SELECTOR = '#searchBody > a';

//four radio boxes
const DATE_RADIO_SELECTOR = '#searchCriteria > tbody > tr > td > table.dcTable > tbody > tr:nth-child(INDEX) > td:nth-child(1) > input[type="radio"]:nth-child(8)';
const DATE_RADIO_SELECTOR1 = '#searchCriteria > tbody > tr > td > table.dcTable > tbody > tr:nth-child(3) > td:nth-child(1) > input[type="radio"]:nth-child(8)';
const DATE_RADIO_SELECTOR2 = '#searchCriteria > tbody > tr > td > table.dcTable > tbody > tr:nth-child(4) > td:nth-child(1) > input[type="radio"]:nth-child(8)';
const DATE_RADIO_SELECTOR3 = '#searchCriteria > tbody > tr > td > table.dcTable > tbody > tr:nth-child(5) > td:nth-child(1) > input[type="radio"]:nth-child(8)';
const DATE_RADIO_SELECTOR4 = '#searchCriteria > tbody > tr > td > table.dcTable > tbody > tr:nth-child(6) > td:nth-child(1) > input[type="radio"]:nth-child(8)';

const TABLE_ROW = '#searchCriteria > tbody > tr > td > table.dcTable > tbody > tr';
//Owner Status
const OWNER_STATUS = '#searchCriteria > tbody > tr > td > table.dcTable > tbody > tr:nth-child(INDEX) > td:nth-child(8)'; // === "Current Owner"
const ACTIVE_ADDRESS_TAB_SELECTOR = '#correctionsTab.anchorEnable  > nobr';

const EMAIL_FIELD = '#searchCriteria > tbody > tr > td > table:nth-child(3) > tbody > tr > td:nth-child(2) > table:nth-child(1) > tbody > tr:nth-child(16) > td:nth-child(2) > input[type="text"]';

async function run() {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    // Log In
    await page.goto('http://dealerconnect.com');
    await page.waitForNavigation();
    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(CREDS.webusername);
    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(CREDS.webpassword);
    await page.click(BUTTON_SELECTOR);
    await page.waitForNavigation();
    
    // Choose Vin
    await page.goto('https://w02.dealerconnect.chrysler.com/sales/timeofsale/COIN/CustomerInformation.jsp?command=customerOwnerInformationInquiry&operation=openCustomerOwnerInformationInquiry&routeFrom=Portlet');
    await page.click(VIN_SELECTOR);
    await page.keyboard.type(aVin);
    await page.click(VIN_BUTTON_SELECTOR);
    await page.waitForNavigation();

    //Choose Date
    //await page.waitFor(2*1000);
    await page.waitForSelector(DATE_RADIO_SELECTOR1);
    await page.click(DATE_RADIO_SELECTOR1);
    await page.waitForSelector(ACTIVE_ADDRESS_TAB_SELECTOR);
    await page.click(ACTIVE_ADDRESS_TAB_SELECTOR);    
    await page.waitForNavigation();

    await page.screenshot({ path: 'screenshots/dc1.png' });
    await page.goBack(options);


    browser.close();
}

run();

process.on('unhandledRejection', (err) => { 
    console.error(err)
    process.exit(1)
  })