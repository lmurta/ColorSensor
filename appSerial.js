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

var portName = "/dev/ttyUSB0"; //Nano
//var portName = "/dev/ttyACM0"; //UNO

var scraper = require('json-scrape')();
var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

// Define the number of samples to keep track of.  The higher the number,
// the more the readings will be smoothed, but the slower the output will
// respond to the input.  Using a constant rather than a normal variable lets
// use this value to determine the size of the readings array.
var smooth_numReadings = 10;
var smooth_readings_R= new Array(smooth_numReadings);      // the readings from the analog input
var smooth_readings_G= new Array(smooth_numReadings);      // the readings from the analog input
var smooth_readings_B= new Array(smooth_numReadings);      // the readings from the analog input
var smooth_index = 0;                  // the index of the current reading
var smooth_total_R = 0;                  // the running total
var smooth_total_G = 0;                  // the running total
var smooth_total_B = 0;                  // the running total
var smooth_average_R = 0;                // the average
var smooth_average_G = 0;                // the average
var smooth_average_B = 0;                // the average
for (var thisReading = 0; thisReading < smooth_numReadings; thisReading++)
  smooth_readings_R[thisReading] = 0; 
for (var thisReading = 0; thisReading < smooth_numReadings; thisReading++)
  smooth_readings_G[thisReading] = 0; 
for (var thisReading = 0; thisReading < smooth_numReadings; thisReading++)
  smooth_readings_B[thisReading] = 0; 

var sp = new SerialPort(portName, {
  baudrate: 115200,
  parser: serialport.parsers.readline("\r\n")
});
sp.flush(function(err,results){});

var RAW= [];
var RGB= [] ;
var RGB2= [] ;
var fBlack =[];
var fWhite=[];
  fBlack[0] = 21000;
  fBlack[1] = 13000;
  fBlack[2] = 21000;
  fWhite[0]= 34000 ;
  fWhite[1]= 21000 ;
  fWhite[2]= 34000 ;

var new_data = {};

var timeStamp;
var dateformat = require('date-format');
var date = new Date() ;

var dataLog = false;
var logInterval = 1000 * 2; //1000 * X segundos
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
    smooth_total_R= smooth_total_R - smooth_readings_R[smooth_index];         
    smooth_total_G= smooth_total_G - smooth_readings_G[smooth_index];         
    smooth_total_B= smooth_total_B - smooth_readings_B[smooth_index];         

    smooth_readings_R[smooth_index] = cleandata.RAW_R; 
    smooth_readings_G[smooth_index] = cleandata.RAW_G; 
    smooth_readings_B[smooth_index] = cleandata.RAW_B; 
    
    smooth_total_R= smooth_total_R + smooth_readings_R[smooth_index];       
    smooth_total_G= smooth_total_G + smooth_readings_G[smooth_index];       
    smooth_total_B= smooth_total_B + smooth_readings_B[smooth_index];       

    smooth_index++;                    
    if (smooth_index >= smooth_numReadings)              
      smooth_index = 0;                           
    smooth_average_R = smooth_total_R / smooth_numReadings;         
    smooth_average_G = smooth_total_G / smooth_numReadings;         
    smooth_average_B = smooth_total_B / smooth_numReadings;         

    
    RAW[0] = smooth_average_R;
    RAW[1] = smooth_average_G;
    RAW[2] = smooth_average_B;
    RGB[0] = cleandata.RGB_R;
    RGB[1] = cleandata.RGB_G;
    RGB[2] = cleandata.RGB_B;
    new_data["RAW_R"] = RAW[0];
    new_data["RAW_G"] = RAW[1];
    new_data["RAW_B"] = RAW[2];



    var i;
    for (i=0; i<3; i++) {
      RGB2[i] = Math.floor(((RAW[i] - fBlack[i]) * 255.0 )/(fWhite[i] - fBlack[i]) );
      if (RGB2[i] < 0) RGB2[i]=0;
      if (RGB2[i] > 255) RGB2[i]=255;
    }
    term.bgColorRgb( RGB2[0] ,RGB2[1] , RGB2[2] , "     " ) 
    console.log(RGB2[0],RGB2[1],RGB2[2],RAW[0],RAW[1],RAW[2]);

    //console.log(cleandata.A0);
});

io.sockets.on('connection', function(socket){
    //send data to client
   socket.emit('serverStartTicker', { logInterval: logInterval });

   setInterval(function(){

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
