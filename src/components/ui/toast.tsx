import React from 'react';

type ToastProps = {
    message: string;
    isVisible: boolean;
    type: 'success' | 'error';
    onClose: () => void;
};

const Toast = ({ message, isVisible, type, onClose }: ToastProps) => {
    if (!isVisible) return null;

    const baseClasses = "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 z-50";
    const typeClasses = type === 'success' ? "bg-green-500" : "bg-red-500";
    const icon = type === 'success' ? (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
    ) : (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
    );

    return (
        <div className={`${baseClasses} ${typeClasses} flex items-center`}>
            {icon}
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-white opacity-75 hover:opacity-100">✕</button>
        </div>
    );
};

export default Toast;