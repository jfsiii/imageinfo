var http   = require('http');
var fs     = require('fs');
var im     = require('imagemagick');
var url    = require('url');
var port   = 8888;
var server = http.createServer(function requestListener(httpRequest, httpResponse) {

  var params    = url.parse(httpRequest.url, true).query;
  var imageURL  = params.url || params.uri || params.image;
  var cbName    = params.callback || params.cb || '';
  var argString = params.format || '{"width": %w, "height": %h}';

  if (!imageURL) {
    var usageHTML = [
      '<!doctype HTML>',
      '<html>',
        '<body>',
          '<script src="https://gist.github.com/3738879.js?file=remote_imageinfo_request.js"></script>',
          '<script src="https://gist.github.com/3738879.js?file=remote_imageinfo_response.txt"></script>',
          '<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js"></script>',
        '</body>',
      '</html>'
    ].join('');

    httpResponse.writeHead(200, {'Content-Type': 'text/html'});
    httpResponse.write(usageHTML);
    httpResponse.end();
   return;
  }

  var args = ['-format', argString, imageURL];
  im.identify(args, function onImageMagickIdentify(err, responseString) {

    if (err) throw err;

    // chomp the trailing newline that is always at the end of `responseString`
    var jsonString  = JSON.stringify({result: responseString.slice(0, -1)});
    var jsonpString = cbName + '(' + jsonString + ')';
    var payload     = cbName ? jsonpString : jsonString;

    httpResponse.writeHead(200, {'Content-Type': 'application/json'});
    httpResponse.write(payload);
    httpResponse.end();
  });
});


server.listen(port);
console.log('image data server created and listening on port', port);
