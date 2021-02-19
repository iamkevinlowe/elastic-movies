import React, {
	useRef,
	useState
} from 'react';

function MoviesSearch({ setSearches = () => null, isLoading = false }) {
	const searchInputEl = useRef(null);

	const [checkBoxStates, setCheckBoxStates] = useState({ title: true, keyword: true, castName: true, character: true });

	const onCheckboxChange = e => {
		const fieldsChecked = Object.values(checkBoxStates)
			.filter(value => value)
			.length;

		if (
			!e.currentTarget.checked
			&& fieldsChecked <= 1
		) {
			alert('At least 1 field must be selected');
			return false;
		}

		checkBoxStates[e.currentTarget.name] = !checkBoxStates[e.currentTarget.name];
		setCheckBoxStates({ ...checkBoxStates });
	};

	const onSearchMoviesSubmit = e => {
		e.preventDefault();

		const { value } = searchInputEl.current;
		const searches = value
			? Object.keys(checkBoxStates)
				.reduce((memo, field) => {
					if (checkBoxStates[field]) {
						memo.push({
							occur: 'should',
							query: 'match',
							value,
							field
						});
					}
					return memo;
				}, [])
			: [];

		setSearches(searches);
	};

	return (
		<form onSubmit={onSearchMoviesSubmit}>
			<div className="input-group mb-2">
				<input
					type="text"
					className="form-control"
					placeholder="Search movies..."
					aria-label="Search movies"
					aria-describedby="button-addon"
					ref={searchInputEl}
					disabled={isLoading} />
				<div className="input-group-append">
					<button
						className="btn btn-outline-secondary"
						type="submit"
						id="button-addon"
						disabled={isLoading}>
						{isLoading
							? <>
								<span
									className="spinner-border spinner-border-sm me-1"
									role="status"
									aria-hidden="true">&nbsp;</span>
								Loading...
							</>
							: 'Search'}
					</button>
				</div>
			</div>

			<div className="text-center">
				<div className="form-check form-check-inline form-switch">
					<input
						className="form-check-input"
						id="checkboxTitle"
						type="checkbox"
						name="title"
						checked={checkBoxStates.title}
						onChange={onCheckboxChange} />
					<label
						className="form-check-label"
						htmlFor="checkboxTitle">Title</label>
				</div>
				<div className="form-check form-check-inline form-switch">
					<input
						className="form-check-input"
						id="checkboxKeyword"
						type="checkbox"
						name="keyword"
						checked={checkBoxStates.keyword}
						onChange={onCheckboxChange} />
					<label
						className="form-check-label"
						htmlFor="checkboxKeyword">Keyword</label>
				</div>
				<div className="form-check form-check-inline form-switch">
					<input
						className="form-check-input"
						id="checkboxCastName"
						type="checkbox"
						name="castName"
						checked={checkBoxStates.castName}
						onChange={onCheckboxChange} />
					<label
						className="form-check-label"
						htmlFor="checkboxCastName">Actor/Actress</label>
				</div>
				<div className="form-check form-check-inline form-switch">
					<input
						className="form-check-input"
						id="checkboxCharacter"
						type="checkbox"
						name="character"
						checked={checkBoxStates.character}
						onChange={onCheckboxChange} />
					<label
						className="form-check-label"
						htmlFor="checkboxCharacter">Character</label>
				</div>
			</div>
		</form>
	);
}

export default MoviesSearch;
