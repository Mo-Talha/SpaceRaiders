var app = require('../app');
var debug = require('debug')('app:server');
var debugio = require('debug')('app:io');
var http = require('http');

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

var server = http.createServer(app);
var io = require('socket.io')(server);
var users = require('./user');

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

io.on('connection', function(socket){
  debugio('A user connected to the app');

  socket.on('NEWUSER', function(username){
    if (!users.hasOwnProperty(username)){
      debugio('Creating new user: ' + username);
      users[username] = socket;
    } else {
      debugio('Cannot create user, Username: ' + username + ' already in use');
      users[username].emit('MESSAGE', 'Username in use.');
    }
  });

  socket.on('disconnect', function(){
    for (var username in users){
      if (users.hasOwnProperty(username)){
        if (socket.id === users[username].id){
          debugio('User disconnected, deleting user: ' + username);
          delete users[username];
        }
      }
    }
  });




});

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') throw error;
  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
