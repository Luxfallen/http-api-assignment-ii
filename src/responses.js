const crypto = require('crypto');

// This feels wrong
const users = {};

let etag = crypto.createHash('sha1').update(JSON.stringify(users));
let digest = etag.digest('hex');

const respondJSON = (request, response, status, obj) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };
  response.writeHead(status, headers);
  response.write(JSON.stringify(obj));
  response.end();
};

// Sends only the headers back
// Could be part of respondJSON, but this way doesn't
// require an object to be generated in the first place
const respondMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };
  response.writeHead(status, headers);
  response.end();
};

// Check if we should respond w/ metadata before making
// object - otherwise, make object and send back normally

const getUsers = (request, response) => {
  // Is the client up-to-date?
  if (request.headers['if-none-match'] === digest) {
    // Yes
    return respondMeta(request, response, 304);
  }
  // No
  if (request.method === 'HEAD') {
    return respondMeta(request, response, 200);
  }
  // The data the client is asking for
  const obj = { users };
  return respondJSON(request, response, 200, obj);
};

// / HIGH PRIORITY
// Still not fleshed out!
const addUser = (request, response, body) => {
  let code = 400;
  const res = {
    message: 'Both name and age are required parameters.',
  };
  if (!body.name || !body.age) {
    res.id = 'missingParameters';
    return respondJSON(request, response, code, res);
  }
  if (users[body.name]) {
    code = 204;
  } else { code = 201; users[body.name] = {}; }
  users[body.name].name = body.name;
  users[body.name].age = body.age;

  // Stuff changed, so make sure to gen a new etag.
  etag = crypto.createHash('sha1').update(JSON.stringify(users));
  digest = etag.digest('hex');

  if (code === 201) {
    res.id = 'addSuccess';
    res.message = 'User Added Successfully';
    return respondJSON(request, response, code, res);
  }
  return respondMeta(request, response, code);
};

const notFound = (request, response) => {
  if (request.method === 'HEAD') {
    return respondMeta(request, response, 404);
  }
  const obj = {
    message: 'The page you are looking for is no where to be found.',
    id: 'notFound',
  };
  return respondJSON(request, response, 404, obj);
};

module.exports = {
  getUsers,
  addUser,
  notFound,
};
