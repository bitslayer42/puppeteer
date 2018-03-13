const XLSX = require('xlsx');


async function loadExcel() { 
    try {
        var workbook = XLSX.readFile("./ListOfVins.xlsx");
    } catch (err) {
        console.log(err.toString()+'\n');
        return;
    }
    var jsonObj = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1'],{raw:true});
    //console.log(jsonObj); return;

    let vinArray = jsonObj.map(obj=>obj.VIN);
    return vinArray;
}  

module.exports = loadExcel;
/////////////////////////////////////
TestRun();

async function TestRun(){
    let res = await loadExcel();
    console.log(JSON.stringify(res, null, 4)); 
}
