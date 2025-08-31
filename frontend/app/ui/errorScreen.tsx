import React from "react";

interface ErrorScreenProps {
	message: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message }) => {
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-red-100 z-50">
			<div className="bg-white rounded-lg shadow-lg px-6 py-4 text-red-700 font-semibold text-lg text-center">
				{message}
			</div>
		</div>
	);
};

export default ErrorScreen;
