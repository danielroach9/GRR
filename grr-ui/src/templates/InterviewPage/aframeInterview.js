import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PresenceVRNavBar from "../PresenceVRNavBar/PresenceVRNavBar"
import { Header, Modal, List, Icon, Button, Divider } from 'semantic-ui-react';
import './aframeInterview.css'

class AframeInterview extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="aframeContainer">
            <Header as='h3'>Aframe</Header>
            <a-scene className='aframeComponent' embedded> 
                <a-entity id="box" geometry="primitive: box" material="color: red"></a-entity>
                <a-entity environment="preset: forest; dressingAmount: 500"></a-entity>
            </a-scene>
            </div>
        )
    }
}

export default AframeInterview;