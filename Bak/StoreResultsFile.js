const fs = require('fs');
let outFile;
let outFileNm = __dirname + '/outfile.txt';
outFile = fs.createWriteStream(outFileNm);


async function StoreResults(resultObj) { 
    for(let i = 0;i<resultObj.length;i++){
        for(let j = 0;j<resultObj[i].Rows.length;j++){
            let vin = resultObj[i].Vin;
            let row = resultObj[i].Rows[j];
            outFile.write(vin + '\t' + row.join('\t')+'\n');
        }
    }
}

module.exports = StoreResults;