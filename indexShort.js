const puppeteer = require('puppeteer');
const CREDS = require('./creds');


async function LogIn(){

    const Vins = ["1C3CCCFB8GN19447112345678"]
    
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
}

async function getACar(page,Vin) {

    //console.log('Vin:',Vin);
    let aCarData = {"Vin":Vin,"Rows":[]}; 
    // Choose Vin
    const VIN_SELECTOR = '#VINLastEight';
    const VIN_BUTTON_SELECTOR = '#searchBody > a';
    await page.click(VIN_SELECTOR);
    await page.keyboard.type(Vin);
    await page.click(VIN_BUTTON_SELECTOR);
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