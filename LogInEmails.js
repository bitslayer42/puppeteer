const CREDS = require('./creds');
const GetVinsEmails = require('./GetVinsEmails');
const StoreResultsEmails = require('./StoreResultsEmails');    //emails

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

async function LogInEmails(emailData,browser){ 
    const VinObj = await GetVinsEmails();
    if(VinObj.length===0){return};
    const Vins = VinObj.recordset.map(obj=>obj.VIN);
    if(Vins.length===0){return};

    const page = await browser.newPage();
    await page.setViewport({width:1000,height:1000});
    // Log In
    const USERNAME_SELECTOR = '#FormsEditField1';
    const PASSWORD_SELECTOR = '#FormsEditField2';
    const BUTTON_SELECTOR = '#userFields > ul > li:nth-child(3) > input';
    await page.goto('http://dealerconnect.com');
    await page.waitForNavigation({timeout:10001});   //after redirect
    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(CREDS.webusername);
    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(CREDS.webpassword);
    await page.click(BUTTON_SELECTOR);
    await page.waitForNavigation({timeout:10002});

    // get email
    await page.goto('https://w02.dealerconnect.chrysler.com/sales/timeofsale/COIN/CustomerInformation.jsp?command=customerOwnerInformationInquiry&operation=openCustomerOwnerInformationInquiry&routeFrom=Portlet');
        
    for (let vin of Vins) {
        let anEmailData = await getEmail(page,vin);
        emailData.push( anEmailData );
    }
    await StoreResultsEmails(emailData,false); // customer data 

    browser.close();

    // console.log(JSON.stringify(emailData, null, 4));
}

async function getEmail(page,Vin) {

    console.log('Vin:',Vin);
    let anEmailData = {"Vin":Vin,"Rows":[]}; 
    // Choose Vin
    const VIN_SELECTOR = '#VINLastEight';
    const VIN_BUTTON_SELECTOR = '#searchBody > a';
    const ERROR_MSG_SELECTOR = '#searchCriteria > tbody > tr > td > table:nth-child(2) > tbody > tr:nth-child(2) > td';
    await page.waitForSelector(VIN_SELECTOR,{timeout:10012});
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
    await page.waitForFunction((sel) => { 
        return document.querySelectorAll(sel).length;
    },{timeout:10000},TABLE_ROW+", "+ERROR_MSG_SELECTOR);
        // On this screen, the "Error message" could also say "Inquiry Successful"
        // Now see which one appeared:
    try {
        await page.waitForSelector(TABLE_ROW,{timeout:100}); //3001
    }
    catch(err) {
        //check for "not found" 
        let ErrMsg = await page.evaluate((sel) => {
            let element = document.querySelector(sel);
            return element? element.innerHTML: null;
        },ERROR_MSG_SELECTOR); //dropdown             
        if(!(ErrMsg)){ ErrMsg = 'WhyYouNoErrMsg?'; }
        console.log(Vin,ErrMsg);// "This VIN is not in COIN. Please use the Report Used Sale tab to enter customer information."
        anEmailData.Rows[0] = {"Row":0,"Description":ErrMsg};
        return anEmailData;
    };

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
        await page.waitForSelector(ACTIVE_ADDRESS_TAB_SELECTOR,{timeout:3025}); //go to address page
        await page.click(ACTIVE_ADDRESS_TAB_SELECTOR);    
        
        await page.waitForSelector(OPT_IN_FLAG,{timeout:10005}); 
        //await page.waitForNavigation({timeout:3001});
        // await page.waitFor(1000); ////////////////////////////////////////////////////////////////////

        let emailAddr = await page.evaluate(() => {
            let element = document.getElementsByName('eMail');
            return element && element[0] && element[0].value ? element[0].value: null;
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

        await page.waitForSelector(BACK_TO_LIST_TAB_SELECTOR,{timeout:3003}); //go back to list
        await page.click(BACK_TO_LIST_TAB_SELECTOR);    
        await page.waitForSelector(TABLE_ROW,{timeout:3035});

        anEmailData.Rows.push(tableRow);
    }
    await page.waitForSelector(BACK_TO_CRITERIA_TAB_SELECTOR,{timeout:3007}); //go back to select vin
    await page.click(BACK_TO_CRITERIA_TAB_SELECTOR);    
    await page.waitForSelector(VIN_BUTTON_SELECTOR,{timeout:3045});
    //console.log("anEmailData",JSON.stringify(anEmailData, null, 4));
    return anEmailData;
}

module.exports = LogInEmails;