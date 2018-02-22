import React, {Component} from 'react';
import ReactDOM from "react-dom";
import {Menu, MenuItem, MenuDivider, Switch} from '@blueprintjs/core';
import GRRNavBar from '../GRRNavBar/GRRNavBar';
import Keyer from '../Keyer/Keyer';
import BackgroundImageList from '../BackgroundImageList/BackgroundImageList';
//import stock360 from '../stock360.png';
import './AssetMgmt.css';

class AssetMgmt extends Component {

    constructor(props){
        super(props);
        this.toggleVRMode = this.toggleVRMode.bind(this);
        this.selectBackground = this.selectBackground.bind(this);
        this.state = {vrMode: false, video:null, width: null, height: null, canvas: null, currentBackground: 'stock360.png'};
    }

    toggleVRMode(){
        this.setState({vrMode: !this.state.vrMode});
        let video = document.getElementById("self");
        easyrtc.setVideoObjectSrc(video, easyrtc.getLocalStream());

    }

    selectBackground (backgroundTitle) {
        this.setState({currentBackground: backgroundTitle});
    }

    componentDidMount(){
        this.myinit();
    }



    myinit(){

        easyrtc.setStreamAcceptor( function(callerEasyrtcid, stream) {
            var video = document.getElementById('caller');
            easyrtc.setVideoObjectSrc(video, stream);
        });

        easyrtc.setOnStreamClosed( function (callerEasyrtcid) {
            easyrtc.setVideoObjectSrc(document.getElementById('caller'), "");
        });

        let video = document.getElementById("self");
        let width = video.width;
        let height = video.height;
        this.setState({video: document.getElementById("self")});
        this.setState({width: document.getElementById("self").width});
        this.setState({height: document.getElementById("self").height});

        // The target canvas.
        let canvas = document.getElementById("c");
        let context = canvas.getContext("2d");

        easyrtc.setRoomOccupantListener( loggedInListener);
        var connectSuccess = function(myId) {
            //console.log("My easyrtcid is " + myId);
        }
        var connectFailure = function(errorCode, errText) {
            console.log(errText);
        }
        let self = this;
        easyrtc.initMediaSource(
            function(){        // success callback
                //var selfVideo = document.getElementById("self");
                easyrtc.setVideoObjectSrc(video, easyrtc.getLocalStream());
                easyrtc.connect("Company_Chat_Line", connectSuccess, connectFailure);
                window.requestAnimationFrame(self.draw.bind(self));
            }, connectFailure);
    }

    loggedInListener(roomName, otherPeers) {
        var otherClientDiv = document.getElementById('otherClients');
        while (otherClientDiv.hasChildNodes()) {
            otherClientDiv.removeChild(otherClientDiv.lastChild);
        }
        for(var i in otherPeers) {
            var button = document.createElement('button');
            button.onclick = function(easyrtcid) {
                return function() {
                    performCall(easyrtcid);
                }
            }(i);

            var label = document.createTextNode(i);
            button.appendChild(label);
            otherClientDiv.appendChild(button);
        }
    }


    performCall(easyrtcid) {
        easyrtc.call(
            easyrtcid,
            function(easyrtcid) { console.log("completed call to " + easyrtcid);},
            function(errorCode, errorText) { console.log("err:" + errorText);},
            function(accepted, bywho) {
                console.log((accepted?"accepted":"rejected")+ " by " + bywho);
            });
    }



    startStream(stream) {
        video.src = URL.createObjectURL(stream);
        video.play();

        // Ready! Let's start drawing.
        requestAnimationFrame(draw);
    }

    draw() {
        let canvas = document.getElementById("c");
        let context = canvas.getContext("2d");
        var frame = this.readFrame();

        if (frame) {
            this.replaceGreen(frame.data);
            context.putImageData(frame, 0, 0);
        }

        // Wait for the next frame.
        window.requestAnimationFrame(this.draw.bind(this));
    }

    readFrame() {
        let canvas = document.getElementById("c");
        let context = canvas.getContext("2d");
        try {
            context.drawImage(this.state.video, 0, 0, this.state.width, this.state.height);
        } catch (e) {
            // The video may not be ready, yet.
            return null;
        }
        return context.getImageData(0, 0, this.state.width, this.state.height);
    }

    replaceGreen(data) {
        var len = data.length;

        for (var i = 0, j = 0; j < len; i++, j += 4) {
            // Convert from RGB to HSL...
            var hsl = this.rgb2hsl(data[j], data[j + 1], data[j + 2]);
            var h = hsl[0], s = hsl[1], l = hsl[2];

            // ... and check if we have a somewhat green pixel.
            if (h >= 90 && h <= 160 && s >= 25 && s <= 90 && l >= 20 && l <= 75) {
                data[j + 3] = 0;
            }
        }
    }

    rgb2hsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;

        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var delta = max - min;
        var h, s, l;

        if (max == min) {
            h = 0;
        } else if (r == max) {
            h = (g - b) / delta;
        } else if (g == max) {
            h = 2 + (b - r) / delta;
        } else if (b == max) {
            h = 4 + (r - g) / delta;
        }

        h = Math.min(h * 60, 360);

        if (h < 0) {
            h += 360;
        }

        l = (min + max) / 2;

        if (max == min) {
            s = 0;
        } else if (l <= 0.5) {
            s = delta / (max + min);
        } else {
            s = delta / (2 - max - min);
        }

        return [h, s * 100, l * 100];
    }




    render() {

        const isVrMode = this.state.vrMode;

        let vidBackground = null;
        if (isVrMode) {
            vidBackground = <div id="background-preview">
                <a-scene>
                    <a-assets>
                        <img id="city" src={`/assets/images/${this.state.currentBackground}`}></img>
                        <canvas id="c" ref="c" width="320" height="240"></canvas>
                        <canvas id="c2" ref="c2" width="320" height="240"></canvas>
                        <video  id="self" ref="self" width="300" height="200" autoPlay></video>
                        <video  id="caller" ref="caller" width="300" height="200"></video>
                    </a-assets>
                    <a-sky id="image-360" radius="10" src={`/assets/images/${this.state.currentBackground}`}></a-sky>
                    <a-video src="#c" width="5" height="2.5" position="-6 -4 -2" rotation="-5 65 0"></a-video>
                    <a-video src="#c2" width="5" height="2.5" position="-5 -4 -6" rotation="-5 65 0"></a-video>
                    <a-entity position="0 -5 0">
                        <a-camera></a-camera>
                    </a-entity>

                    <a-entity progressive-controls="objects: a-box"></a-entity>
                    {/* <!-- hover & drag-drop won't have any obvious effect without some additional event handlers or components. See the examples page for more --> */}
                    <a-box hoverable grabbable stretchable draggable dropppable
                    color="blue" position="0 0 -1"></a-box>

                </a-scene>

            </div>;
        } else {
            vidBackground = <div id="background-preview">

                        <canvas id="c" ref="c" width="320" height="240"></canvas>
                        <canvas id="c2" ref="c2" width="320" height="240"></canvas>
                        <video  id="self" ref="self" width="300" height="200" muted="muted" autoPlay></video>
                        <video  id="caller" ref="caller" width="300" height="200"></video>
                        </div>
        }

        return (
            <div>
                <GRRNavBar/>
                <div className="flex-container">
                    <BackgroundImageList onSelectedBackground={this.selectBackground}></BackgroundImageList>
                    <div className="preview-container" >
                        <h6 id="previewItemTitle">
                            <Switch checked={this.state.vrMode} labelElement={<strong>VR Mode Enabled </strong>} onChange={this.toggleVRMode} />
                        </h6>
                        {vidBackground}
                    </div>
                </div>
            </div>


        );
    }
}

export default AssetMgmt;