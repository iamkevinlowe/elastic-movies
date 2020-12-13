import React from 'react';
import { render } from 'react-dom';

const getUserModule = () => import(/* webpackChunkName: "UsersAPI" */ './common/usersAPI');

function App() {
	return <button onClick={() => {
		getUserModule()
			.then(({ getUsers }) => {
				getUsers().then(json => console.log(json));
			});
	}}>Load!</button>;
}

render(<App />, document.getElementById('root'));
