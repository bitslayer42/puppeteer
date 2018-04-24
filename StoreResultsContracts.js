const CREDS = require('./creds');
const sql = require('mssql');

const config = {  
    user: CREDS.dbuserName,  
    password: CREDS.dbpassword,  
    server:   CREDS.dbserver,
    database: CREDS.dbdatabase,  
}; 

async function StoreResultsContracts(resultObj) { 
    sql.close();
    try {
        let pool = await sql.connect(config);

        await pool.request().query("DELETE DealerConnectContracts;")

        for(let i = 0;i<resultObj.length;i++){
                await pool.request()
                .input('Vin', sql.VarChar(17), resultObj[i].Vin)
                .input("NoContract", sql.VarChar(20), resultObj[i].NoContract)
                .input("Message", sql.VarChar(200), resultObj[i].Message)          
                .execute('UploadDealerConnectContracts');  

        }

        sql.close();
        pool.close();
    } catch (err) {
        console.log(err);
    }
}  

sql.on('error', err => {
    console.log(err);
})

module.exports = StoreResultsContracts;

///////////////////////////////////////////////////////
TestRun();
async function TestRun(){
    const resultObj = [{
        "Vin": "2C4RC1GG3JR100527",
        "Rows": [
            {
                "Row": 1,
                "PurchaseDate": "2018-1-1",
                "Description": "CHRYSLER PACIFICA        ",
                "FullName": "HENDERSONVILLE, HENDERSONV",
                "OwnerStatus": "ServiceCustomer",
                "Address": "401 DUNCAN HILL RD                                          ",
                "City": "HENDERSONVILLE                  ",
                "State": "NC",
                "Zip": "287922718013",
                "Phone": "(828) 692-8777 Do Not Call",
                "EmailAddr": "hennesyville@msn.com",
                "Title": "1 - Mr."
            },
            {
                "Row": 2,
                "PurchaseDate": "02/02/2018",
                "Description": "CHRYSLER PACIFICAZ       ",
                "FullName": "HENDERSONVILLE, HENDERSONV",
                "OwnerStatus": "ServiceCustomer",
                "Address": "401 DUNCAN HILL RD                                          ",
                "City": "HENDERSONVILLE                  ",
                "State": "NC",
                "Zip": "287922718013",
                "Phone": "(828) 692-8777 Do Not Call",
                "EmailAddr": "hennesyville@msn.com",
                "Title": "1 - Mr."
            }            
        ]
    }];

    let res = await StoreResultsContracts(resultObj);
    console.log(JSON.stringify(res, null, 4)); 
}