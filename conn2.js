const CREDS = require('./creds');
var Request = require('tedious').Request;  
var TYPES = require('tedious').TYPES;  

var Connection = require('tedious').Connection;  
var config = {  
    userName: CREDS.dbuserName,  
    password: CREDS.dbpassword,  
    server:   CREDS.dbserver,  
}; 
  
  var connection = new Connection(config);
  
  connection.on('connect', function(err) {
      // If no error, then good to go...
      GetList();
    }
  );
  
  connection.on('debug', function(text) {
      //console.log(text);
    }
  );
  
  function GetList() {
    request = new Request("select top 10 VIN from deals where make = 'CHRYSLER' AND NEW_USED_CERTUSED = 'New' ORDER BY DATE desc;", 
        function(err, rowCount) {
        if (err) {
            console.log(err);
        } else {
            console.log(rowCount + ' rows');
        }
    
        connection.close();
    });     

    request.on('row', function(columns) {
      columns.forEach(function(column) {
        if (column.value === null) {
          console.log('NULL');
        } else {
          console.log(column.value);
        }
      });
    });
  
    request.on('done', function(rowCount, more) {
      console.log(rowCount + ' rows returned');
    });
  
    // In SQL Server 2000 you may need: connection.execSqlBatch(request);
    connection.execSql(request);
  }

//   module.exports = MapView;
//   module.exports.TileManager = TileManager;