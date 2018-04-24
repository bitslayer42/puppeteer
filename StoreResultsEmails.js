const CREDS = require('./creds');
const sql = require('mssql');

const config = {  
    user: CREDS.dbuserName,  
    password: CREDS.dbpassword,  
    server:   CREDS.dbserver,
    database: CREDS.dbdatabase,  
}; 

async function StoreResultsEmails(resultObj,Delete) { 
    sql.close();
    try {
        let pool = await sql.connect(config);

        if(Delete){
            await pool.request().query("DELETE DealerConnect;");
        }else{

            for(let i = 0;i<resultObj.length;i++){
                for(let j = 0;j<resultObj[i].Rows.length;j++){
                    let vin = resultObj[i].Vin;
                    let row = resultObj[i].Rows[j];
                    await pool.request()
                    .input('Vin', sql.VarChar(17), vin)
                    .input('Row', sql.Int, row.Row)
                    .input("PurchaseDate", sql.VarChar(20), row.PurchaseDate)
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
                }
            }
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

module.exports = StoreResultsEmails;

