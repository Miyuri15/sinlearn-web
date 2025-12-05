import React from 'react';
import Image from 'next/image';

type PDFViewerProps = {
    fileName: string;
    fileUrl: string;
    onClose: () => void;
};

const PDFViewer = ({ fileName, fileUrl, onClose }: PDFViewerProps) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Image src="/icons/document.svg" alt="Document" width={20} height={20} />
                        <h3 className="font-semibold text-gray-800 truncate">{fileName}</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition duration-150"
                        aria-label="Close PDF viewer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* PDF Content */}
                <div className="flex-1 overflow-hidden bg-gray-100">
                    <iframe
                        src={fileUrl}
                        className="w-full h-full border-0"
                        title={fileName}
                    />
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

export default PDFViewer;