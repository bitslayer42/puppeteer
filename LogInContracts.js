const CREDS = require('./creds');
const GetVinsContracts = require('./GetVinsContracts');
const StoreResultsContracts = require('./StoreResultsContracts'); //has contract info

async function LogInContracts(contractData,browser){  //(called at bottom of file to start program)
    const VinObj = await GetVinsContracts();

    const Vins = VinObj.recordset.map(obj=>obj.VIN);
    if(Vins.length===0){return};
    
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
    await StoreResultsContracts(contractData,false); // data if has contract

    browser.close();
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
    await page.waitForFunction((sel) => { 
        return document.querySelectorAll(sel).length;
    },{timeout:10000},CONTRACT_RADIO_SELECTOR+", "+ERROR_MSG_SELECTOR); //#admRadio, #msg > span:nth-child(3)")
        // One of these should appear, we don't know which
        // Now see which one appeared:
    try {
        await page.waitForSelector(CONTRACT_RADIO_SELECTOR,{timeout:10}); //1000 
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

module.exports = LogInContracts;
