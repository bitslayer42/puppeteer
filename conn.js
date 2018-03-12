const CREDS = require('./creds');
var Request = require('tedious').Request;  
var TYPES = require('tedious').TYPES;  

var Connection = require('tedious').Connection;  
var dbconfig = {  
    userName: CREDS.dbuserName,  
    password: CREDS.dbpassword,  
    server:   CREDS.dbserver,  
    // If you are on Microsoft Azure, you need this:  
    //options: {encrypt: true, database: 'AdventureWorks'}  
};  
var connection = new Connection(dbconfig);  
connection.on('connect', function(err) {
    // If no error, then good to go...
    executeStatement();
  }
);

connection.on('debug', function(text) {
    //console.log(text);
  }
);

function executeStatement() {  
    request = new Request("SELECT Fuel FROM AutoCrossPro.dbo.Fuel;", function(err) {  
        if (err) {console.log(err);}  
        connection.close();
    });  
    var result = "";  
    request.on('row', function(columns) {  
        columns.forEach(function(column) {  
          if (column.value === null) {  
            console.log('NULL');  
          } else {  
            result+= column.value + " ";  
          }  
        });  
        console.log(result);  
        result ="";  
    });  

    request.on('done', function(rowCount, more) {  
        console.log(rowCount + ' rows returned');  
    });  
    connection.execSql(request);  

}      

function executeInsertStatement() {  
    request = new Request("INSERT SalesLT.Product (Name, ProductNumber, StandardCost, ListPrice, SellStartDate) OUTPUT INSERTED.ProductID VALUES (@Name, @Number, @Cost, @Price, CURRENT_TIMESTAMP);", function(err) {  
     if (err) {  
        console.log(err);}  
    });  
    request.addParameter('Name', TYPES.NVarChar,'SQL Server Express 2014');  
    request.addParameter('Number', TYPES.NVarChar , 'SQLEXPRESS2014');  
    request.addParameter('Cost', TYPES.Int, 11);  
    request.addParameter('Price', TYPES.Int,11);  
    request.on('row', function(columns) {  
        columns.forEach(function(column) {  
          if (column.value === null) {  
            console.log('NULL');  
          } else {  
            console.log("Product id of inserted item is " + column.value);  
          }  
        });  
    });       
    connection.execSql(request);  
}  