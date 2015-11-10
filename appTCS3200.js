/*
Arduino TCS3200_sample
sudo npm install -g

nodemon appSerial.js
*/

'use strict';
var express = require('express');
var debug = require('debug')('ColorSensor:server');
var http = require('http');
var app = express();
var server = require('http').Server(app);
//var io = require('socket.io')(http);
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
var server = http.createServer(app);
server.listen(app.get('port'));
server.on('error', onError);
server.on('listening', onListening);
var io = require('socket.io').listen(server);

var path = require('path');
//var io = require('socket.io').listen(app.listen());

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

// Require the lib, get a working terminal 
var term = require( 'terminal-kit' ).terminal ;
//var ArduinoFirmata = require('arduino-firmata');
//var arduino = new ArduinoFirmata().connect();

//var portName = "/dev/ttyUSB0"; //Nano
var portName = "/dev/ttyACM0"; //UNO

var scraper = require('json-scrape')();
var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor
var RAW= [];
var RGB= [];
var fBlack =[];
var fWhite=[];
      fBlack[0] = 3; 
      fBlack[1] = 3;
      fBlack[2] = 4;
      fWhite[0]= 36;
      fWhite[1]= 38;
      fWhite[2]= 57;

var sp = new SerialPort(portName, {
  baudrate: 115200,
  parser: serialport.parsers.readline("\r\n")
});
sp.flush(function(err,results){});

var new_data = {};

var timeStamp;
var dateformat = require('date-format');
var date = new Date() ;

var dataLog = false;
var logInterval = 1000 * 1; //1000 * X segundos
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.get('/foo', function (req, res, next) {
  res.render('foo', { title: "This is totally foo"});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

sp.on("data", function (data) {
  //console.log(data);
  scraper.write(data.toString());

});
scraper.on('data', function (cleandata) {
    //console.log(cleandata);

    if (typeof cleandata.RAW_R != "number") {
      console.log('This is not number');
      return;
    }
    RGB[0] = cleandata.RGB_R;
    RGB[1] = cleandata.RGB_G;
    RGB[2] = cleandata.RGB_B;
    RAW[0] = cleandata.RAW_R;
    RAW[1] = cleandata.RAW_G;
    RAW[2] = cleandata.RAW_B;

    var i;
    for (i=0; i<3; i++) {
      RGB[i] = Math.floor(((RAW[i] - fBlack[i]) * 255.0 )/(fWhite[i] - fBlack[i]) );
      if (RGB[i] < 0) RGB[i]=0;
      //if (RGB[i] > 255) RGB[i]=255;
    }
    
    new_data["RGB_R"] = RGB[0];
    new_data["RGB_G"] = RGB[1];
    new_data["RGB_B"] = RGB[2];
    new_data["RAW_R"] = cleandata.RAW_R;
    new_data["RAW_G"] = cleandata.RAW_G;
    new_data["RAW_B"] = cleandata.RAW_B;


/*
    var i;
    for (i=0; i<3; i++) {
      RGB2[i] = Math.floor(((RAW[i] - fBlack[i]) * 255.0 )/(fWhite[i] - fBlack[i]) );
      if (RGB2[i] < 0) RGB2[i]=0;
      if (RGB2[i] > 255) RGB2[i]=255;
    }
*/
//    term.bgColorRgb( RGB2[0] ,RGB2[1] , RGB2[2] , "     " ) 
//    console.log(RGB2[0],RGB2[1],RGB2[2],RAW[0],RAW[1],RAW[2]);
//    term.bgColorRgb( RGB[0] ,RGB[1] , RGB[2] , "     " ) 
//    console.log(RGB[0],RGB[1],RGB[2],cleandata.RAW_R,cleandata.RAW_G,cleandata.RAW_B);
    term.bgColorRgb( RGB[0] ,RGB[1] , RGB[2] , "     " ) 
    console.log(RGB[0],RGB[1],RGB[2],RAW[0],RAW[1],RAW[2]);

    //console.log(cleandata.A0);
});

io.sockets.on('connection', function(socket){
    //send data to client
   socket.emit('serverStartTicker', { logInterval: logInterval });

   setInterval(function(){
    //////////////////////DEBUG
    //new_data["RAW_R"] = 10000 + Math.random()*100000;
    //new_data["RAW_G"] = 10000 + Math.random()*100000;
    //new_data["RAW_B"] = 10000 + Math.random()*100000;
    //console.log(new_data);
    //return;
      socket.emit('new_data', new_data);

        socket.emit('serverStartTicker', { logInterval: logInterval });
      date = new Date() ;
      //console.log(date.toISOString());
    }, logInterval);
});



module.exports = app;


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
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

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
