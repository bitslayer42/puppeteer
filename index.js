const puppeteer = require('puppeteer');
const CREDS = require('./creds');
const GetVins = require('./GetVins');
const StoreResults = require('./StoreResults');

const colNames = {
    5: 'PurchaseDate',
    6: 'Description',
    7: 'FullName',
    8: 'OwnerStatus',
    9: 'Address',
    10:'City',
    11:'State',
    12:'Zip',
    13:'Phone'
};

async function LogIn(){
    const VinObj = await GetVins();
    const Vins = VinObj.recordset.map(obj=>obj.VIN);
     console.log(JSON.stringify(Vins, null, 4)); 
    
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    let carData = [];

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
    await page.goto('https://w02.dealerconnect.chrysler.com/sales/timeofsale/COIN/CustomerInformation.jsp?command=customerOwnerInformationInquiry&operation=openCustomerOwnerInformationInquiry&routeFrom=Portlet');

    for (let vin of Vins) {
        carData.push( await getACar(page,vin) );
    }
    browser.close();
    StoreResults(carData);
    console.log(JSON.stringify(carData, null, 4));
}

async function getACar(page,Vin) {

    //console.log('Vin:',Vin);
    let aCarData = {"Vin":Vin,"Rows":[]}; 
    // Choose Vin
    const VIN_SELECTOR = '#VINLastEight';
    const VIN_BUTTON_SELECTOR = '#searchBody > a';
    await page.click(VIN_SELECTOR);

    //clear Vin field
    await page.keyboard.down('ControlLeft');
    await page.keyboard.type('a');
    await page.keyboard.up('ControlLeft');
    await page.keyboard.press('Backspace');

    await page.keyboard.type(Vin);
    await page.click(VIN_BUTTON_SELECTOR);

    //Choose Date
    const TABLE_ROW = '#searchCriteria > tbody > tr > td > table.dcTable > tbody > tr';
    await page.waitForSelector(TABLE_ROW,{timeout:30011});
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
        let tableRow = {"Row":i-2};
        for(let j = 5; j <= 13; j++){ //columns in table that we care about
            let ColVal = await page.evaluate((sel) => {
                let element = document.querySelector(sel);
                return element? element.innerHTML: null;
            }, TABLE_FIELDS.replace("ROWINDEX", i).replace("COLINDEX", j));

            ColVal=ColVal.replace(/\t|\n/g,'');
            j===8   //OwnerStatus
            ? ColVal=ColVal.replace('<br>','').replace(/\s/g,'')
            : j===13 //PhoneNumber
            ? ColVal=ColVal.replace('&nbsp;<img src="images/check.gif" width="10" height="10">'," Verified")
                           .replace('<strike>','').replace('</strike>'," Do Not Call") 
            : ColVal=ColVal;
            let colName = colNames[j];
            //console.log(colName,ColVal);
            tableRow[colName] = ColVal;
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
        //console.log('emailAddr:',emailAddr);
        tableRow['EmailAddr'] = emailAddr;

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
        //console.log('Title:',Title);
        tableRow['Title'] = Title;

        await page.waitForSelector(BACK_TO_LIST_TAB_SELECTOR,{timeout:30003}); //go back to list
        await page.click(BACK_TO_LIST_TAB_SELECTOR);    
        await page.waitForSelector(TABLE_ROW);

        aCarData.Rows.push(tableRow);
    }
    await page.waitForSelector(BACK_TO_CRITERIA_TAB_SELECTOR,{timeout:30007}); //go back to select vin
    await page.click(BACK_TO_CRITERIA_TAB_SELECTOR);    
    await page.waitForSelector(VIN_BUTTON_SELECTOR);
    //console.log("aCarData",JSON.stringify(aCarData, null, 4));
    return aCarData;
}

LogIn();

//if any awaits time out, program ends
process.on('unhandledRejection', (err) => { 
    console.error(err)
    process.exit(1)
  })

// let filepath = 'screenshots/dc' + i + '.png';
// await page.screenshot({ path: filepath });

// Syntax for async error handling
// try {
//     await myFunc(param);  
// } catch(e) {
//     return cb('Error msg');
// }