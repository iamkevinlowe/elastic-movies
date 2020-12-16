import React from 'react';
import { NavLink } from 'react-router-dom';

function NavBar() {
	return (
		<nav className="nav">
			<NavLink className="nav-link" activeClassName="active" exact to="/">Home</NavLink>
			<NavLink className="nav-link" activeClassName="active" exact to="/movies">Movies</NavLink>
		</nav>
	);
}

export default NavBar;
