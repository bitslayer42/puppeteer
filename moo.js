
let x = [1,2,3,4,5,6,7,8];

function splitarray(input, spacing)
{
    var output = [];

    for (var i = 0; i < input.length; i += spacing)
    {
        output[output.length] = input.slice(i, i + spacing);
    }

    return output;
}

console.log(splitarray(x,3));

