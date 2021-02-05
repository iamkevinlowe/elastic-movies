import React from 'react';
import {
	BrowserRouter as Router,
	Redirect,
	Route,
	Switch
} from 'react-router-dom';

import NavBar from './NavBar';
import Movie from './Movie';
import MoviesList from './MoviesList';
import MoviesDashboard from './MoviesDashboard';

function App() {
	return (
		<Router>
			<NavBar />

			<Switch>
				<Route exact path="/movies/:id" component={Movie} />
				<Route exact path="/movies" component={MoviesList} />
				<Route exact path="/" component={MoviesDashboard} />
				<Redirect to="/" />
			</Switch>
		</Router>
	);
}

export default App;
