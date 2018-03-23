// Load required modules
const http    = require("http");              // http server core module
const https   = require("https");     // https server core module
const fs = require("fs");
var express = require("express");           // web framework external module
let forceSsl = require('express-force-ssl');
var serveStatic = require('serve-static');  // serve static files
let socketIo = require("socket.io");        // web socket external module
var easyrtc = require("../index");               // EasyRTC external module
let request = require('request');
const configs = require("./configs/configs");
let env = require('node-env-file');
env(__dirname + '/.env');
var bodyParser = require('body-parser');
var cors = require('cors');
var roomModel = require("./app/models/room.model");


//database configs
var dbConfig = require('./configs/database.config.js');
var mongoose = require('mongoose');

//database setup
mongoose.connect(dbConfig.url, {});

mongoose.connection.on('error', function() {
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

mongoose.connection.once('open', function() {
    console.log("Successfully connected to the database");
});

const HTTP_PORT = 8080;
const HTTPS_PORT = 8000;
let rest = [];
let dir1, dir2;

let prod = parseInt(process.env.PROD);

if (prod) {
    console.log('Production Enabled');
} else {
    console.log("Development Enabled");
}

// Set process name
process.title = "node-easyrtc";

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
var app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(cors());

//Disbale forceSsl in dev
//app.use(forceSsl);
//app.use(serveStatic('static', {'index': 'grr-ui/build/index.html'}));
app.use(express.static(__dirname + "/../grr-ui/build/https/", {dotfiles:'allow'}));
app.use(express.static(__dirname + "/../grr-ui/build/https2/", {dotfiles:'allow'}));
app.use(express.static(__dirname + "/../grr-ui/build/", {dotfiles:'allow'}));
require('./app/routes/room.routes')(app);


let httpServer = http.createServer(app);

let options, socketServer, secureServer;

if (prod) { 
    options = {
        key:  fs.readFileSync(configs.https.key),
        cert: fs.readFileSync(configs.https.cert)
    }

    secureServer = https.createServer( options, app);
    socketServer = socketIo.listen(secureServer, {"log level":1});
} else {
    socketServer = socketIo.listen(httpServer, {"log level":1});
}
// Start Express http server on port 8080
//var webServer = http.createServer(app);


// Start Socket.io so it attaches itself to Express server


easyrtc.setOption("logLevel", "debug");


easyrtc.on("getIceConfig", request.bind(this, configs.request, (error, response, body) => {
    if (!error && response.statusCode == 200) {
        let info = JSON.parse(body);
        console.log(info.v.iceServers);
        easyrtc.setOption('appIceServers', info.v.iceServers);
      }
}));


// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on("easyrtcAuth", function(socket, easyrtcid, msg, socketCallback, callback) {
    easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function(err, connectionObj){
        if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
            callback(err, connectionObj);
            return;
        }

        console.log("hiiiiiiii");
        connectionObj.setField("credential", msg.msgData.credential, {"isShared":false});

        console.log("["+easyrtcid+"] Credential saved!", connectionObj.getFieldValueSync("credential"));

        callback(err, connectionObj);
    });
});

easyrtc.events.on("msgTypeGetRoomList", function (connectionObj, socketCallback, next) {
    easyrtc.util.logDebug("getRoomList fired! Checking GRR DB to find rooms");
    let appObj = connectionObj.getApp();
    roomModel.find(function (err, rooms) {
        if(err) {
            easyrtc.util.logDebug("Unable to retrieve existing rooms from GRR database");
            // TODO: Send socket.io message back to client explaining error.
            return;
        }

        else {
            connectionObj.generateRoomList(function (error, roomList) {
                if (error) {
                    easyrtc.util.logDebug("Unable to retrieve existing EasyRTCServer rooms.");
                    // TODO: Send socket.io message back to client explaining error.
                    return;
                }

                else {
                    let existingRooms = Object.keys(roomList);
                    rooms.forEach(function (room) {
                        if (!existingRooms.includes(room['name'])) {
                            easyrtc.util.logDebug("Room '" + room['name'] +"' does not exist. Attempting creation.");
                            appObj.createRoom(room['name'], null, function (err, roomObj) {
                                if (err) {
                                    easyrtc.util.logDebug("Unable to create room");
                                }
                                else {
                                    existingRooms.push(room['name']);
                                    console.log(existingRooms);
                                }
                            });
                        }

                        else {
                            easyrtc.util.logDebug("Room '"+ room['name'] + "' exists. Doing nothing.");
                        }
                    });

                    connectionObj.generateRoomList(function (err, roomList) {
                        easyrtc.util.sendSocketCallbackMsg(connectionObj.getEasyrtcid(), socketCallback,{"msgType": "roomList", "msgData":{"roomList":roomList}}, appObj);
                    });
                }
            });
        }
    });
});

easyrtc.events.on("roomCreate", function(appObj, creatorConnectionObj, roomName, roomOptions, callback) {
    easyrtc.util.logDebug("roomCreate fired! Trying to create: " + roomName);
    appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
});

easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParameter, callback) {
    easyrtc.util.logDebug("aRE YOY SHOUWING");
    console.log("["+connectionObj.getEasyrtcid()+"] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
});

// Start EasyRTC server
const rtcServer = easyrtc.listen(app, socketServer, {logLevel:"debug", logDateEnable:true, logMessagesEnable: true, demosEnable: false, appAutoCreateEnable: false, roomDefaultEnable: false, appDefaultName: 'GameRoomRecruiting'}, function(err, rtcRef) {

    console.log("Initiated");
    rtcRef.app(null, function (err, appObj) {});

    //listen on PORT
    if (prod) {
        secureServer.listen(HTTPS_PORT, function () {
            console.log(`setup HTTPS Server`);
        });
    }

    httpServer.listen(HTTP_PORT, function() {
        console.log(`Setup HTTP Server`);
    });
});