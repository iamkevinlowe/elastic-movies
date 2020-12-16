import React from 'react';
import {
	BrowserRouter as Router,
	Redirect,
	Route,
	Switch
} from 'react-router-dom';

import NavBar from './NavBar';
import MoviesList from './MoviesList';

function App() {
	return (
		<Router>
			<NavBar />

			<Switch>
				<Route exact path="/movies">
					<MoviesList />
				</Route>
				<Route exact path="/">
					<h1>Home</h1>
				</Route>
				<Redirect to="/" />
			</Switch>
		</Router>
	);
}

export default App;
