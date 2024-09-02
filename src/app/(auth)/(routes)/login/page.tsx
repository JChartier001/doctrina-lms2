'use client';
import { LoginForm } from '@devshop24/component-library';
import React from 'react';
import * as z from 'zod';
interface LoginResponse {
	error?: string;
	success?: string;
	twoFactor?: boolean;
}
export const LoginSchema = z.object({
	email: z.string().email({
		message: 'Email is required',
	}),
	password: z.string().min(1, {
		message: 'Password is required',
	}),
	code: z.optional(z.string()),
});

const LoginPage = () => {
	const login = async (values: {
		[key: string]: string;
	}): Promise<LoginResponse> => {
		console.log('login');
		// Mock implementation of login logic
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				// Simulating a successful login response
				resolve({
					success: 'Logged in successfully',
					// error: 'Invalid credentials',
					// twoFactor: true,
				});
			}, 1000);
		});
	};

	const handleClick = (provider: 'google' | 'facebook') => {
		console.log(provider);
	};

	return (
		<LoginForm
			login={login}
			LoginSchema={LoginSchema}
			title={'Doctrina'}
			subtitle={'All in one education platform'}
			image={'./logo_light.png'}
			onClick={handleClick}
			fieldsMetadata={{
				email: {
					label: 'Email',
					type: 'text',
				},
				password: {
					label: 'Password',
					type: 'text',
				},
			}}
		/>
	);
};

export default LoginPage;
