const CREDS = require('./creds');
const sql = require('mssql');

const config = {  
    user: CREDS.dbuserName,  
    password: CREDS.dbpassword,  
    server:   CREDS.dbserver,
    database: CREDS.dbdatabase,  
}; 


async function GetVinsEmails() { 
    sql.close();
    request = "select VIN from DealerConnect_VinList where Vin NOT IN (select Vin from DealerConnectDemog) AND Vin IN (select Vin from DealerConnectContracts group by Vin HAVING MIN(NoContract+0) = 1)  order by vin ;"
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

module.exports = GetVinsEmails;
/////////////////////////////////////////////////////
TestRun();
async function TestRun(){
    let res = await GetVinsEmails();
    console.log(JSON.stringify(res, null, 4)); 
}
