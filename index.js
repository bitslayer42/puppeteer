const puppeteer = require('puppeteer');
const CREDS = require('./creds');
// var Request = require('tedious').Request;  
// var TYPES = require('tedious').TYPES;  
// var Connection = require('tedious').Connection;  



async function LogIn(){
    const aVin = '1C3CCCFB8GN194471'; //'2C4RC1GG3JR100527'; //2A8HR54199R612914
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await getACar(page,aVin);
    browser.close();
}

async function getACar(page,aVin) {


    // Log In
    const USERNAME_SELECTOR = '#FormsEditField1';
    const PASSWORD_SELECTOR = '#FormsEditField2';
    const BUTTON_SELECTOR = '#userFields > ul > li:nth-child(3) > input';
    await page.goto('http://dealerconnect.com');
    await page.waitForNavigation();   //after redirect
    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(CREDS.webusername);
    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(CREDS.webpassword);
    await page.click(BUTTON_SELECTOR);
    await page.waitForNavigation();
    
    // Choose Vin
    const VIN_SELECTOR = '#VINLastEight';
    const VIN_BUTTON_SELECTOR = '#searchBody > a';
    await page.goto('https://w02.dealerconnect.chrysler.com/sales/timeofsale/COIN/CustomerInformation.jsp?command=customerOwnerInformationInquiry&operation=openCustomerOwnerInformationInquiry&routeFrom=Portlet');
    await page.click(VIN_SELECTOR);
    await page.keyboard.type(aVin);
    await page.click(VIN_BUTTON_SELECTOR);

    //Choose Date
    const TABLE_ROW = '#searchCriteria > tbody > tr > td > table.dcTable > tbody > tr';
    await page.waitForSelector(TABLE_ROW);
    let numTableRows = await page.evaluate((sel) => {
        return document.querySelectorAll(sel).length;
      }, TABLE_ROW);

    //radio boxes (tr:nth-child(INDEX) should start at 3)
    const DATE_RADIO_SELECTOR = '#searchCriteria > tbody > tr > td > table.dcTable > tbody > tr:nth-child(INDEX) > td:nth-child(1) > input[type="radio"]:nth-child(8)';
    //Table Columns
    const TABLE_FIELDS = '#searchCriteria > tbody > tr > td > table.dcTable > tbody > tr:nth-child(ROWINDEX) > td:nth-child(COLINDEX)';

    //Tabs at top to go to address screen, back to table, and back to select another VIN
    const ACTIVE_ADDRESS_TAB_SELECTOR = '#correctionsTab.anchorEnable  > nobr';
    const BACK_TO_LIST_TAB_SELECTOR = '#listTab > nobr';
    const BACK_TO_CRITERIA_TAB_SELECTOR = '#criteriaTab > nobr';
    ////Address Screen
    const TITLE_FIELD_DROPDOWN = '#searchCriteria > tbody > tr > td > table:nth-child(3) > tbody > tr > td:nth-child(2) > table:nth-child(1) > tbody > tr:nth-child(8) > td:nth-child(2) > select'; 
    const TITLE_FIELD_TEXT = '#searchCriteria > tbody > tr > td > table:nth-child(3) > tbody > tr:nth-child(1) > td:nth-child(2) > table:nth-child(1) > tbody > tr:nth-child(8) > td:nth-child(2) > table > tbody > tr > td'; 
    const OPT_IN_FLAG = '#searchCriteria > tbody > tr > td > table:nth-child(3) > tbody > tr > td:nth-child(2) > table:nth-child(1) > tbody > tr:nth-child(3) > td:nth-child(1) > input[type="radio"]:nth-child(1)';

    // document.querySelector('#searchCriteria > tbody > tr > td > table:nth-child(3) > tbody > tr > td:nth-child(2) > table:nth-child(1) > tbody > tr:nth-child(16) > td:nth-child(2) > input[type="text"]');    
    // document.querySelector('#searchCriteria > tbody > tr > td > table:nth-child(3) > tbody > tr:nth-child(4) > td:nth-child(2) > input[type="text"]');    

    for (let i = 3; i <= numTableRows; i++) { 
        // TABLE VALUES
        for(let j = 5; j <= 13; j++){
            let ColVal = await page.evaluate((sel) => {
                let element = document.querySelector(sel);
                return element? element.innerHTML: null;
            }, TABLE_FIELDS.replace("ROWINDEX", i).replace("COLINDEX", j));
            j!==8?console.log('Column'+j+':',ColVal.replace(/\n/g,'')):console.log('Column'+j+':',ColVal.replace('<br>','').replace(/\s/g,''));
        }

        let RadioSelector = DATE_RADIO_SELECTOR.replace("INDEX", i);
        await page.click(RadioSelector);
        await page.waitForSelector(ACTIVE_ADDRESS_TAB_SELECTOR); //go to address page
        await page.click(ACTIVE_ADDRESS_TAB_SELECTOR);    
        
        await page.waitForSelector(OPT_IN_FLAG,{timeout:30005}); 
        //await page.waitForNavigation({timeout:30001});
        //await page.waitFor(1000);

        let emailAddr = await page.evaluate(() => {
            let element = document.getElementsByName('eMail');
            return element? element[0].value: null;
          });
        console.log('emailAddr:',emailAddr);

        let Title = await page.evaluate((sel) => {
            let element = document.querySelector(sel);
            return element? element.options[element.selectedIndex].text: null;
          },TITLE_FIELD_DROPDOWN); //dropdown
        if(Title===null){
            Title = await page.evaluate((sel) => {
                let element = document.querySelector(sel);
                return element? element.innerHTML: null;
            },TITLE_FIELD_TEXT); //just text
        }
            console.log('Title:',Title);

        //await page.waitFor(500);
        await page.waitForSelector(BACK_TO_LIST_TAB_SELECTOR,{timeout:30003}); //go back to list
        //await page.waitFor(500);
        await page.click(BACK_TO_LIST_TAB_SELECTOR);    
        await page.waitForSelector(TABLE_ROW);

    }



    // browser.close();
}

LogIn();

//if any awaits time out, program ends
process.on('unhandledRejection', (err) => { 
    console.error(err)
    process.exit(1)
  })

// let filepath = 'screenshots/dc' + i + '.png';
// await page.screenshot({ path: filepath });
