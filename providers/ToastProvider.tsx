'use client';
import { useTheme as useNextTheme } from 'next-themes';
import { Bounce, ToastContainer } from 'react-toastify';

const ToastProvider = () => {
	const { resolvedTheme } = useNextTheme();

	// Map next-themes values to react-toastify theme values
	const getToastTheme = () => {
		switch (resolvedTheme) {
			case 'dark':
				return 'dark';
			case 'light':
				return 'light';
			default:
				return 'colored'; // fallback for system or undefined
		}
	};

	return (
		<ToastContainer
			position="top-right"
			autoClose={2000}
			hideProgressBar={true}
			newestOnTop
			closeOnClick={false}
			rtl={false}
			pauseOnFocusLoss={false}
			draggable
			pauseOnHover={false}
			theme={getToastTheme()}
			transition={Bounce}
		/>
	);
};

export { ToastProvider };
