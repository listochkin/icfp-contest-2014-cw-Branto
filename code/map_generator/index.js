var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var map_file = {generate: false, file: ''};
process.argv.forEach(function (val, index, array) {
    //console.log(index + ': ' + val);
    if(index == 2 && val == '--genmap')
        map_file.generate = true;
    if(index == 3 && val)
        map_file.file = val;
});
if(map_file.generate && map_file.file) {
    var map_generator = require("./map_generator");
    console.log('Start map generation to file "' + map_file.file + '"');
    var fs = require('fs');
    var file = __dirname + '/options.json';
    console.log('Loading options from file:' + file);
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }
        data = JSON.parse(data);
        console.dir(data);
        var map = map_generator.generate(data.map_x,data.map_y,  data.power_pills, data.fruits, data.ghosts, data.lambda_man);
        fs.writeFile(__dirname + '/map/' + map_file.file + '.map', map.get_txt(), function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
            }
        });
    });

    //response.write(map.get_html());
}
else {
    console.log('For use console mode write \>node index --genmap filename');
    var handle = {}
    handle["/"] = requestHandlers.start;
    handle["/start"] = requestHandlers.start;
    handle["/upload"] = requestHandlers.upload;

    server.start(router.route, handle);
}
