const puppeteer = require('puppeteer');
const CREDS = require('./creds');
const GetVinsContracts = require('./GetVinsContracts');
const StoreResultsContracts = require('./StoreResultsContracts'); //has contract info
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

let contractData = [];   //array of aCarData = {"Vin":Vin, "NoContract":null, "Message":null}; 
let emailData = []; //array of anEmailData = {"Vin":Vin,"Rows":[]};  1C4PJMLX2JD526667

async function LogIn(){  //(called at bottom of file to start program)
    const VinObj = await GetVinsContracts();

    const Vins = VinObj.recordset.map(obj=>obj.VIN);
    console.log(JSON.stringify(Vins, null, 4)); 
    
    //const Vins = ['3C6UR5CL3JG206752','1C3CCCABOGN147460'];
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.setViewport({width:1000,height:1000});


    // Log In
    const USERNAME_SELECTOR = '#FormsEditField1';
    const PASSWORD_SELECTOR = '#FormsEditField2';
    const BUTTON_SELECTOR = '#userFields > ul > li:nth-child(3) > input';
    await page.goto('http://dealerconnect.com');
    await page.waitForNavigation({timeout:30001});   //after redirect
    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(CREDS.webusername);
    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(CREDS.webpassword);
    await page.click(BUTTON_SELECTOR);
    await page.waitForNavigation({timeout:30002});
    
    // checkIfNoContract   
    for(let ix=0;ix<Vins.length;ix++){    
        contractData.push( await checkIfNoContract(page,Vins[ix],ix) );
        //await checkIfNoContract(page,Vins[ix],ix);
    };
    await StoreResultsContracts(contractData); // data if has contract
    // //filter only no contract
    // let noContractCarData = carData.filter(car=>car.NoContract===true)
    // // get email
    // await page.goto('https://w02.dealerconnect.chrysler.com/sales/timeofsale/COIN/CustomerInformation.jsp?command=customerOwnerInformationInquiry&operation=openCustomerOwnerInformationInquiry&routeFrom=Portlet');
    // for (let aNoContractCar of noContractCarData) {
    //     emailData.push( await getEmail(page,aNoContractCar.Vin) );
    // }

    // StoreResults(emailData); // customer data 

    browser.close();

    console.log(JSON.stringify(emailData, null, 4));
}

async function checkIfNoContract(page,Vin,ix) { 
    let aCarData = {"Vin":Vin, "NoContract":null, "Message":''};  
    const VIN_SELECTOR = '#vin';
    const SUBMIT_BUTTON_SELECTOR = '#SearchBody > a';
    const ERROR_MSG_SELECTOR = '#msg > span:nth-child(3)';   //error message: "No records matched the given search criteria" 
    const CONTRACT_SELECTOR = 'body > form > table:nth-child(7) > tbody > tr > td > table > tbody > tr:nth-child(ROWNUM) > td:nth-child(3) > a';
                               
    const CONTRACT_RADIO_SELECTOR = '#admRadio';

    await page.goto("https://w05.dealerconnect.chrysler.com/sales/cscweb/cscsales/dealersales/adminSearch.do?operation=init");
    
    await page.waitForSelector(VIN_SELECTOR,{timeout:30003});
    await page.click(VIN_SELECTOR);  
    await page.keyboard.type(Vin);
    await page.click(SUBMIT_BUTTON_SELECTOR);    
    try {
        await page.waitForSelector(CONTRACT_RADIO_SELECTOR,{timeout:1000}); 
    }
    catch(err) {
        //check for "not found" 
        let ErrMsg = await page.evaluate((sel) => {
            let element = document.querySelector(sel);
            return element? element.innerHTML: null;
        },ERROR_MSG_SELECTOR); //dropdown             
        if(ErrMsg){
            console.log(Vin,ErrMsg);
            aCarData.Message = ErrMsg; // "No records matched the given search criteria"
            aCarData.NoContract = true;
        }else{   //timeout on CONTRACT_RADIO_SELECTOR is too short?
            console.log(Vin,'WhyYouNoErrMsg?');
            aCarData.NoContract = null;
            aCarData.Message = 'WhyYouNoErrMsg?';
        }
        return aCarData;
    };
   //document.querySelector('body > form > table:nth-child(7) > tbody > tr > td > table > tbody > tr:nth-child(3) > td:nth-child(3) > a')
    //Contract List Table appears:
    //await page.waitForSelector(CONTRACT_RADIO_SELECTOR,{timeout:1000});
    let numTableRows = await page.evaluate((sel) => {
        return document.querySelectorAll(sel).length;
    }, CONTRACT_RADIO_SELECTOR);

    let HasContract = false;
    for (let i = 3; i < (numTableRows+3); i++) {
        let CONTRACT_SELECTOR_I = CONTRACT_SELECTOR.replace("ROWNUM", i);
        await page.waitForSelector(CONTRACT_SELECTOR_I,{timeout:30004});
        let ContractNumber = await page.evaluate((sel) => { 
            return document.querySelector(sel).onmouseover.toString().split("'")[1].substring(23).split('\\n');
        }, CONTRACT_SELECTOR_I);

        for(let i=0;i<ContractNumber.length;i++){
            if(ContractNumber[i].search(/L|W/)===0){
                await console.log(Vin,"Has Warranty: ",ContractNumber[i]);
                HasContract = true;
            }else{
                await console.log(Vin,"Not a Warranty: ",ContractNumber[i]);
            }
        }
        
        aCarData.Message = ContractNumber.join(' - ');
        aCarData.NoContract = !HasContract;
    }
    return aCarData;

}

async function getEmail(page,Vin) {

    //console.log('Vin:',Vin);
    let anEmailData = {"Vin":Vin,"Rows":[]}; 
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
    await page.waitForSelector(TABLE_ROW,{timeout:30013});
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
        await page.waitForSelector(ACTIVE_ADDRESS_TAB_SELECTOR,{timeout:30014}); //go to address page
        await page.click(ACTIVE_ADDRESS_TAB_SELECTOR);    
        
        await page.waitForSelector(OPT_IN_FLAG,{timeout:30015}); 
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

        await page.waitForSelector(BACK_TO_LIST_TAB_SELECTOR,{timeout:30017}); //go back to list
        await page.click(BACK_TO_LIST_TAB_SELECTOR);    
        await page.waitForSelector(TABLE_ROW,{timeout:30018});

        anEmailData.Rows.push(tableRow);
    }
    await page.waitForSelector(BACK_TO_CRITERIA_TAB_SELECTOR,{timeout:30019}); //go back to select vin
    await page.click(BACK_TO_CRITERIA_TAB_SELECTOR);    
    await page.waitForSelector(VIN_BUTTON_SELECTOR,{timeout:30021});
    //console.log("anEmailData",JSON.stringify(anEmailData, null, 4));
    return anEmailData;
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