import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = [
	// {
	//   id: 1,
	//   msg: 'Please log in',
	//   alertType: 'success'
	// }
];

export default function (state = initialState, action) {
	// destructure
	const { type, payload } = action;

	switch (type) {
		case SET_ALERT:
			// [make a copy of current state, add new alert (contains data)]
			return [...state, payload];
		case REMOVE_ALERT:
			// remove specific alert by it's id
			return state.filter(alert => alert.id !== payload);
		default:
			return state;
	}
}
