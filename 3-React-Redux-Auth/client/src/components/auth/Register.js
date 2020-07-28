import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
// import axios from 'axios';

const Register = () => {
	// setFormData - function we want to run to update our formData
	const [formData, setFormData] = useState(
		// default/initial state values
		{
			name: '',
			email: '',
			password: '',
			password2: '',
		}
	);

	// destructure
	const { name, email, password, password2 } = formData;

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
		// make sure that passwords match
		if (password !== password2) {
			console.log('Passwords do not match');
		} else {
			// // console.log(formData);
			// // create a new user object
			// const newUser = {
			// 	name: name,
			// 	email: email,
			// 	password: password,
			// };

			// try {
			// 	const config = {
			// 		headers: {
			// 			'Content-Type': 'application/json',
			// 		},
			// 	};

			// 	// data to send to our backend
			// 	const body = JSON.stringify(newUser);

			// 	// make a post request to backend to send user data
			// 	const res = await axios.post(
			// 		// route to send
			// 		'/api/users',
			// 		// data we want to send
			// 		body,
			// 		// pass any configuration
			// 		config
			// 	);
			// 	console.log(res.data); // returns a token - we can use it later to access protected routes
			// } catch (err) {
			// 	console.error(err.response.data);
			// }
			console.log('Success');
		}
	};

	return (
		<Fragment>
			<section className='container'>
				<h1 className='large text-primary'>Sign Up</h1>
				<p className='lead'>
					<i className='fas fa-user'></i> Create Your Account
				</p>
				<form className='form' onSubmit={e => onSubmit(e)}>
					<div className='form-group'>
						<input
							type='text'
							placeholder='Name'
							name='name'
							value={name}
							onChange={e => onChange(e)}
							required
						/>
					</div>
					<div className='form-group'>
						<input
							type='email'
							placeholder='Email Address'
							name='email'
							value={email}
							onChange={e => onChange(e)}
							required
						/>
						<small className='form-text'>
							This site uses Gravatar so if you want a profile image, use a
							Gravatar email
						</small>
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
					<div className='form-group'>
						<input
							type='password'
							placeholder='Confirm Password'
							name='password2'
							value={password2}
							onChange={e => onChange(e)}
							minLength='6'
						/>
					</div>
					<input type='submit' className='btn btn-primary' value='Register' />
				</form>
				<p className='my-1'>
					Already have an account? <Link to='/login'>Sign In</Link>
				</p>
			</section>
		</Fragment>
	);
};

export default Register;
