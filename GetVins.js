const CREDS = require('./creds');
const sql = require('mssql');

const config = {  
    user: CREDS.dbuserName,  
    password: CREDS.dbpassword,  
    server:   CREDS.dbserver,
    database: CREDS.dbdatabase,  
}; 


async function GetVins() { 
    sql.close();
    request = "select VIN from deals where make = 'CHRYSLER' AND NEW_USED_CERTUSED = 'New' ORDER BY DATE desc;"; 
    try {
        let pool = await sql.connect(config)
        let result1 = await pool.request()
            .query(request)
        sql.close();            
        pool.close();    
        return result1;
    } catch (err) {
        console.log(err);
    }
}  

sql.on('error', err => {
    console.log(err);
})

module.exports = GetVins;
/////////////////////////////////////////////////////
TestRun();
async function TestRun(){
    let res = await GetVins();
    console.log(JSON.stringify(res, null, 4)); 
}
