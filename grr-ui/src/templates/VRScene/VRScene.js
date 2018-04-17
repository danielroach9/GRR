//import 'aframe';
import 'aframe-aabb-collider-component';
import React from 'react';
import ReactDOM from 'react-dom';

import grabAsset from "../../js/aframe_components/grab-assets";
import itemSelector from "../../js/aframe_components/vr-arm-item-selector";
import previewIcon from "../../js/aframe_components/vr-arm-preview-icon";
import vrEraser from "../../js/aframe_components/vr-eraser";
import vrEraserToggle from "../../js/aframe_components/vr-eraser-toggle";

import {API_URL} from "../api.config";


import vrInit from "../../js/aframe/init";

import styles from './VRScene.css';
console.log("styles");
console.log(styles);

class VRScene extends React.Component {

    // constructor(props) {
    //     super(props);
    //     this.toggleVRMode = this.toggleVRMode.bind(this);
    //     this.selectBackground = this.selectBackground.bind(this);
    //     this.refreshSettings = this.refreshSettings.bind(this);
    //     this.state = {vrMode: false, video:null, width: null, height: null, canvas: null, roomName:'', currentBackground: 'stock360.png', backgroundImages: [], assetImages: []};
    // }

    constructor(props){
        super(props);
        this.vrInit = this.vrInit.bind(this);
        this.run = this.run.bind(this);
    }

    componentDidMount() {
        this.vrInit();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.assetImages.length !== this.props.assetImages.length) {
            console.log("assetListUpdated");
            this.run();
        }
    }

    vrInit() {
        let controllers = document.querySelectorAll('[hand-controls]');
        let els = Array.prototype.slice.call(controllers);
        els.forEach((el) => {
            console.log('ELEMENT');
            console.log(el);
            el.addEventListener('hitstart', (e) => {
                e.target.addState('colliding');
                let sphere = e.target.querySelector('.sphere-controller');
                if (sphere) {
                    sphere.setAttribute('material', 'color: #39ceef');
                }
            });

            el.addEventListener('hitend', (e) => {
                e.target.addState('free');
                let sphere = e.target.querySelector('.sphere-controller');
                if (sphere) {
                    sphere.setAttribute('material', 'color: #1d39d7');
                }
            });
        });
        // end test

        let scene = document.querySelector('a-scene');

        if (scene.hasLoaded) {
            this.run();
        } else {
            scene.addEventListener('loaded', this.run);
        }
    }

    run() {

        let assetList = [];
        this.props.assetImages.map( (asset, index) => {

            let objAsset1 = document.createElement('a-asset-item');
            objAsset1.setAttribute('id', 'obj-asset-'+index);
            objAsset1.setAttribute('src', API_URL + "/images/" + asset+ ".obj");

            let mtlAsset1 = document.createElement('a-asset-item');
            mtlAsset1.setAttribute('id', 'mtl-asset-'+index);
            mtlAsset1.setAttribute('src', API_URL + "/images/" + asset + ".mtl");

            let assets = document.querySelector('a-assets');
            assets.appendChild(objAsset1);
            assets.appendChild(mtlAsset1);

            assetList.push({
                name: asset,
                obj: '#obj-asset-'+index,
                mtl: '#mtl-asset-'+index
            });

        });



        let itemSelector = document.querySelector('a-entity[item-selector]');
        itemSelector.setAttribute('item-selector', 'assetList:' + JSON.stringify(assetList));
        console.log('ITEMSEL', itemSelector);
    }


    // <a-sky id="image-360" radius="10" src={API_URL+"/images/"+this.state.currentBackground}></a-sky>
    // <img id="city" src={API_URL+"/images/"+this.state.currentBackground}></img>
    render () {
        return (
            <a-scene className={styles.vrScene}>

                <a-assets>
                    <canvas id="c" ref="c" width="320" height="240" style={{visibility: "hidden"}}></canvas>
                    <canvas id="c2" ref="c2" width="320" height="240"></canvas>
                    <video  id="self" ref="self" width="300" height="200" muted="muted" style={{visibility: "hidden"}} autoPlay></video>
                    <video  id="caller" ref="caller" width="300" height="200"></video>
                </a-assets>
                <a-sky id="image-360" radius="10" src={API_URL+"/images/"+this.props.currentBackground}></a-sky>
                <a-video src="#c" width="5" height="2.5" position="-5 -4 -6" rotation="-5 65 0"></a-video>

                <a-entity position="0 -5 0">
                    <a-camera></a-camera>
                    <a-entity id="camera" camera></a-entity>

                    <a-entity hand-controls="left" grab-assets aabb-collider="objects: .collides">
                        <a-sphere class="sphere-controller" radius="0.03" color="blue" position="0 -0.01 0.2"></a-sphere>
                        <a-entity class="testSelector" item-selector></a-entity>
                    </a-entity>
                    <a-entity hand-controls="right" grab-assets aabb-collider="objects: .collides">
                        <a-sphere class="sphere-controller" radius="0.03" color="blue" position="0 -0.01 0.2"></a-sphere>
                    </a-entity>
                </a-entity>



            </a-scene>
        );
    }
}

//ReactDOM.render(<VRScene/>, document.querySelector('#sceneContainer'));

// <a-entity hand-controls="left" grab-assets aabb-collider="objects: .collides">
//                 <a-sphere class="sphere-controller" radius="0.03" color="blue" position="0 -0.01 0.2"></a-sphere>
//                 <a-entity class="testSelector" item-selector></a-entity>
//             </a-entity>
//             <a-entity hand-controls="right" grab-assets aabb-collider="objects: .collides">
//                 <a-sphere class="sphere-controller" radius="0.03" color="blue" position="0 -0.01 0.2"></a-sphere>
//             </a-entity>

export default VRScene;
