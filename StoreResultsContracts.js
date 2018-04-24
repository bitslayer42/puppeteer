const CREDS = require('./creds');
const sql = require('mssql');

const config = {  
    user: CREDS.dbuserName,  
    password: CREDS.dbpassword,  
    server:   CREDS.dbserver,
    database: CREDS.dbdatabase,  
}; 

async function StoreResultsContracts(resultObj,Delete) { 
    sql.close();
    try {
        let pool = await sql.connect(config);

        if(Delete){
            await pool.request().query("DELETE DealerConnectContracts;")
        }else{
            for(let i = 0;i<resultObj.length;i++){
                    await pool.request()
                    .input('Vin', sql.VarChar(17), resultObj[i].Vin)
                    .input("NoContract", sql.VarChar(20), resultObj[i].NoContract)
                    .input("Message", sql.VarChar(200), resultObj[i].Message)          
                    .execute('UploadDealerConnectContracts');  
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

module.exports = StoreResultsContracts;
