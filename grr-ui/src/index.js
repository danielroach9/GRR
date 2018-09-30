import AssetMgmt from "./templates/AssetMgmt/AssetMgmt";
import RoomList from "./templates/RoomList/RoomList";
import Homepage from "./templates/Homepage/Homepage";
import LoginPage from "./templates/LoginPage/LoginPage"
import { BrowserRouter, Switch, Route } from 'react-router-dom';

var ReactDOM = require('react-dom');
var React = require('react');

let root = document.getElementById('root');

ReactDOM.render((
	<div>
		<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.3/semantic.min.css"></link>
		<BrowserRouter>
		<Switch>
			<Route exact path='/' component = {LoginPage} />
			<Route exact path='/home' component = {Homepage} />
			<Route exact path='/rooms' component = {RoomList} />
			<Route path='/rooms/:roomID' component = {AssetMgmt} />
		</Switch>
	</BrowserRouter>
	</div>
	
), root);
