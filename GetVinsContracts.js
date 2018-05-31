const CREDS = require('./creds');
const sql = require('mssql');

const config = {  
    user: CREDS.dbuserName,  
    password: CREDS.dbpassword,  
    server:   CREDS.dbserver,
    database: CREDS.dbdatabase,  
}; 


async function GetVinsContracts() { 
    sql.close();
    request = "select VIN from DealerConnect_VinList WHERE Vin NOT IN (select Vin from DealerConnectContracts) AND (IsNumeric(RIGHT(Vin,1)) = 1) order by vin ;"  
    try {
        let pool = await sql.connect(config)
        let result1 = await pool.request()
            .query(request)
        await sql.close();            
        await pool.close();    
        return result1;
    } catch (err) {
        console.log(err);
    }
}  

sql.on('error', err => {
    console.log(err);
})

module.exports = GetVinsContracts;

