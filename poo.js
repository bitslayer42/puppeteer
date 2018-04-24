
  


async function Run(){  //(called at bottom of file to start program)
    console.log("first do this");
    
    process.on('unhandledRejection', firsterr);

    process.removeListener('unhandledRejection', firsterr);
    process.on('unhandledRejection', seconderr);

    await promise1.then((res) => {
        return reportToUser(JSON.pasre(res)); // note the typo (`pasre`)
    }); // no `.catch` or `.then`      

}


    var promise1 = new Promise(function(resolve, reject) {
        setTimeout(resolve, 100, 'foo');
      });



Run();

function firsterr (reason, p) {
    console.log('erreone');
};
function seconderr (reason, p) {
    console.log('erretwo');
};