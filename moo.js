

let res = await GetVins();
console.log(res);

async function GetVins() {  
    return Promise.resolve(1);

}  

// sql.on('error', err => {
//     // ... error handler
// })



//module.exports = GetVins;
