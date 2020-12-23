import React from 'react';

function Carousel({ list = [], title = '' }) {
	if (!list.length) {
		return;
	}

	return (
		<>
			<h1>{title}</h1>
			{list.map(item => {
				return <div key={item.id}>{item.title}</div>;
			})}
		</>
	);
}

export default Carousel;
