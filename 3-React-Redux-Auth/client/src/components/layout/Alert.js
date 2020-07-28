import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Alert = ({ alerts }) =>
	alerts !== null &&
	alerts.length > 0 &&
	alerts.map(alert => (
		<div className={`alert alert-${alert.alertType}`} key={alert.id}>
			{alert.msg}
		</div>
	));

Alert.propTypes = {
	alerts: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
	alerts: state.alert,
});

// everytime we want out component to interact with redux like call an action or use state, we're using connect
export default connect(mapStateToProps)(Alert);
