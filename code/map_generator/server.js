var http = require("http");
var url = require("url");


function start(route, handle, servport) {
    if(isNaN(servport))
        servport = 5000;

    function onRequest(request, response) {
        var postData = "";
        var pathname = url.parse(request.url).pathname;
        console.log("Request for " + pathname + " received.");

        request.setEncoding("utf8");

        request.addListener("data", function(postDataChunk) {
            postData += postDataChunk;
            console.log("Received POST data chunk '"+
                postDataChunk + "'.");
        });

        request.addListener("end", function() {
            route(handle, pathname, response, postData);
        });

    }

    http.createServer(onRequest).listen(servport);
    console.log("Node.js server running on port:"+ servport);
    return servport;
}
if(!module.parent){
    start();
}
else {
    exports.start = start;
    console.log("Server required by module: " + module.parent.filename);
}