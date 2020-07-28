import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
	// setFormData - function we want to run to update our formData
	const [formData, setFormData] = useState(
		// default/initial state values
		{
			email: '',
			password: '',
		}
	);

	// destructure
	const { email, password } = formData;

	// when we type something in a input fire up this function
	const onChange = e =>
		// update form state
		setFormData({
			// make a copy of a state
			...formData,
			// update name, to whatever was passed in an input
			// we use [e.target.name] to update all other fields that contain 'name' as a key value, for example name='email', name='password'
			[e.target.name]: e.target.value,
		});

	// when form is submitted
	// const onSubmit = async e => {
	const onSubmit = e => {
		e.preventDefault();
		console.log('Success');
	};

	return (
		<Fragment>
			<section className='container'>
				<h1 className='large text-primary'>Sign In</h1>
				<p className='lead'>
					<i className='fas fa-user'></i> Sign Into Your Account
				</p>
				<form className='form' onSubmit={e => onSubmit(e)}>
					<div className='form-group'>
						<input
							type='email'
							placeholder='Email Address'
							name='email'
							value={email}
							onChange={e => onChange(e)}
							required
						/>
					</div>
					<div className='form-group'>
						<input
							type='password'
							placeholder='Password'
							name='password'
							value={password}
							onChange={e => onChange(e)}
							minLength='6'
						/>
					</div>
					<input type='submit' className='btn btn-primary' value='Login' />
				</form>
				<p className='my-1'>
					Don't have an account? <Link to='/register'>Sign Up</Link>
				</p>
			</section>
		</Fragment>
	);
};

export default Login;
