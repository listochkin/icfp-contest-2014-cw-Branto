var querystring = require("querystring");
var map_generator = require("./map_generator");
function start(response, postData) {
    console.log("Request handler 'start' was called.");

    var body = '<html>'+
        '<head>'+
        '<meta http-equiv="Content-Type" content="text/html; '+
        'charset=UTF-8" />'+
        '</head>'+
        '<body>'+
        '<form action="/upload" method="post">'+
        'Map x: <input name = "map_x" value="10"><br>'+
        'Map y: <input name = "map_y" value="10"><br>'+
        'Power pills: <input name = "power_pills" value="4"><br>'+
        'Fruits: <input name = "fruits" value="4"><br>'+
        'Ghosts: <input name = "ghosts" value="4"><br>'+
        'Lambda mans: <input name = "lambda_man" value="1"><br>'+
        '<input type="submit" value="Submit text" />'+
        '</form>'+
        '</body>'+
        '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function upload(response, postData) {
    console.log("Request handler 'upload' was called.");
    response.writeHead(200, {"Content-Type": "text/html"});
    var map_x = parseInt(querystring.parse(postData).map_x);
    var map_y = parseInt(querystring.parse(postData).map_y);
    var power_pills =parseInt(querystring.parse(postData).power_pills);
    var fruits = parseInt(querystring.parse(postData).fruits);
    var ghosts = parseInt(querystring.parse(postData).ghosts);
    var lambda_man = parseInt(querystring.parse(postData).lambda_man);
    response.write("You've set map: " + map_x + 'x' + map_y + '\n<br> Generated \n<br>');

    var map = map_generator.generate(map_x,map_y,  power_pills, fruits, ghosts, lambda_man);
    response.write(map.get_html());
    response.write("Code map: <textarea cols = '"+(map_x+2)+"' rows= '"+(map_y+2)+"'>"+map.get_txt()+'</textarea>\n<br>');
    response.end();
}

exports.start = start;
exports.upload = upload;