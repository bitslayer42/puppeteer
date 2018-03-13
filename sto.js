
const CREDS = require('./creds');
const sql = require('mssql');

const config = {  
    user: CREDS.dbuserName,  
    password: CREDS.dbpassword,  
    server:   CREDS.dbserver,
    database: CREDS.dbdatabase,  
}; 

RunIt();
async function RunIt(){
    const resultObj = {
    "Vin": "2C4RC1GG3JR100527",
    "Row": 1,
    "PurchaseDate": "2018-12-12",
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
    };

    let res = await StoreResults(resultObj);
    console.log(JSON.stringify(res, null, 4)); 
}

async function StoreResults(row) { 
    //let Vin,Row,PurchaseDate,Description,FullName,OwnerStatus,Address,City,State,Zip,Phone,EmailAddr,Title;
    //sql.close();
    try {
        let pool = await sql.connect(config);

                await pool.request()
                    .input('Vin', sql.VarChar(17), row.Vin)
                    .input('Row', sql.Int, row.Row)
                    .input("PurchaseDate", sql.Date, row.PurchaseDate)
                    .input("Description", sql.VarChar(200), row.Description)
                    .input("FullName", sql.VarChar(200), row.FullName)
                    .input("OwnerStatus", sql.VarChar(200), row.OwnerStatus)
                    .input("Address", sql.VarChar(200), row.Address)
                    .input("City", sql.VarChar(200), row.City)
                    .input("State", sql.VarChar(200), row.State)
                    .input("Zip", sql.VarChar(200), row.Zip)
                    .input("Phone", sql.VarChar(200), row.Phone)
                    .input("EmailAddr", sql.VarChar(200), row.EmailAddr)
                    .input("Title", sql.VarChar(200), row.Title)          
                    .execute('UploadDealerConnect');



        sql.close();            
        pool.close();             
    } catch (err) {
        console.log(err);
    }
}  

sql.on('error', err => {
    console.log(err);
})

module.exports = StoreResults;
