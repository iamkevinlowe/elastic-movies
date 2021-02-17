import React, {
	useState
} from 'react';

import { getNameFromCode } from '../common/utils/UtilLanguages';

const GENDER_MAP = ['Unlisted', 'Female', 'Male', 'Non-binary'];

function MovieFilterItem({ title = '', field = '', items = [], onFieldKeyClick = () => null }) {
	const [activeKeys, setActiveKeys] = useState([]);

	const getLabel = key => {
		switch (field) {
			case 'castGender':
			case 'crewGender':
				return GENDER_MAP[key];
			case 'originalLanguage':
			case 'spokenLanguage':
				return getNameFromCode(key);
			case 'releaseDate':
				return new Date(key).toLocaleDateString();
			default:
				return key;
		}
	};

	const onListItemClick = e => {
		e.preventDefault();

		const { key } = e.currentTarget.dataset;

		if (activeKeys.includes(key)) {
			activeKeys.splice(activeKeys.indexOf(key), 1);
		} else {
			activeKeys.push(key);
		}

		onFieldKeyClick(field, activeKeys);
		setActiveKeys([...activeKeys]);
	};

	return (
		items.length
		? <>
			{title}
			<ul className="list-group">
				{items.map(({ key, doc_count }) => (
					<a
						href=""
						className={`list-group-item list-item-group-action d-flex justify-content-between align-items-center${activeKeys.includes(key) ? ' active' : ''}`}
						key={key}
						data-key={key}
						onClick={onListItemClick}>
						{getLabel(key)}
						<span className="badge text-white bg-primary rounded-pill">{doc_count.toLocaleString()}</span>
					</a>
				))}
			</ul>
		</>
		: null
	);
}

export default MovieFilterItem;
