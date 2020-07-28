import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';
// redux
import { Provider } from 'react-redux';
import store from './store';

import './App.css';

const App = () => (
	// wrap your whole app in Provider component, so all components can access app level state
	<Provider store={store}>
		<Router>
			<Fragment>
				<Navbar />
				{/* path - url to page, component - what component to load when we enter this url */}
				<Route exact path='/' component={Landing} />
				<section className='container'>
					<Alert />
					<Switch>
						<Route exact path='/register' component={Register} />
						<Route exact path='/login' component={Login} />
					</Switch>
				</section>
			</Fragment>
		</Router>
	</Provider>
);

export default App;

// npm install axios react-router-dom redux react-redux redux-thunk redux-devtools-extension moment react-moment
