const http = require('http');
const url = require('url');
const query = require('querystring');
const handler = require('./responses.js');
const htmlHandler = require('./htmlResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  const parsedURL = url.parse(request.url);

  if (request.method === 'GET' || request.method === 'HEAD') {
    switch (parsedURL.pathname) {
      case '/':
        htmlHandler.getIndex(request, response);
        break;
      case '/style.css':
        htmlHandler.getStyle(request, response);
        break;
      case '/getUsers':
        handler.getUsers(request, response);
        break;
      case '/notReal':
      default:
        handler.notFound(request, response);
        break;
    }
  } else if (request.method === 'POST') {
    if (parsedURL.pathname === '/addUser') {
      const res = response;
      const body = [];
      request.on('error', (err) => {
        console.dir(err);
        res.statusCode = 400;
        res.end();
      });
      request.on('data', (chunk) => {
        body.push(chunk);
      });
      request.on('end', () => {
        const bodyString = Buffer.concat(body).toString();
        const bodyParams = query.parse(bodyString);
        handler.addUser(request, response, bodyParams);
      });
    }
  } else {
    handler.notFound(request, response);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1:${port}`);
