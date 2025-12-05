import React, { useState } from 'react';
import Image from 'next/image';

type ImageViewerProps = {
    fileName: string;
    fileUrl: string;
    onClose: () => void;
};

const ImageViewer = ({ fileName, fileUrl, onClose }: ImageViewerProps) => {
    const [zoom, setZoom] = useState(100);

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 25, 200));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 25, 50));
    };

    const handleResetZoom = () => {
        setZoom(100);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="font-semibold text-gray-800 truncate">{fileName}</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition duration-150"
                        aria-label="Close image viewer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center justify-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
                    <button
                        onClick={handleZoomOut}
                        className="p-2 rounded-lg hover:bg-gray-200 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={zoom <= 50}
                        aria-label="Zoom out"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                        </svg>
                    </button>
                    <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
                        {zoom}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        className="p-2 rounded-lg hover:bg-gray-200 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={zoom >= 200}
                        aria-label="Zoom in"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                    </button>
                    <button
                        onClick={handleResetZoom}
                        className="ml-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition duration-150"
                    >
                        Reset
                    </button>
                </div>

                {/* Image Content */}
                <div className="flex-1 overflow-auto bg-gray-100 p-4">
                    <div className="flex items-center justify-center min-h-full">
                        <img
                            src={fileUrl}
                            alt={fileName}
                            style={{ 
                                width: `${zoom}%`,
                                maxWidth: 'none',
                                height: 'auto'
                            }}
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center">
                    <a
                        href={fileUrl}
                        download={fileName}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-150 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </a>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageViewer;