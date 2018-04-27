
  
const { performance  } = require('perf_hooks');
var t0, t1;
async function Run(){  //(called at bottom of file to start program)
    process.on('unhandledRejection', firsterr);
    t0 = performance.now();
    console.log("first do this");
    

    process.removeListener('unhandledRejection', firsterr);
    process.on('unhandledRejection', seconderr);

    await promise1.then((res) => {
        return reportToUser(JSON.pasre(res)); // note the typo (`pasre`)
    }); // no `.catch` or `.then`      

    t1 = performance.now();
    console.log("it took " + (t1 - t0) + " milliseconds.");
}


    var promise1 = new Promise(function(resolve, reject) {
        setTimeout(resolve, 100, 'foo');
      });



Run();

function firsterr (reason, p) {
    console.log('erreone',reason, p);
};
function seconderr (reason, p) {
    console.log('erretwo');
    t1 = performance.now();
    console.log("it took " + (t1 - t0) + " milliseconds.");
};