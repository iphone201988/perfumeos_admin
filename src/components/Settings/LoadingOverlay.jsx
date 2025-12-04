// src/components/Settings/LoadingOverlay.jsx
import React from 'react';

const LoadingOverlay = ({ isVisible, importing, exportProgress }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#352AA4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {importing ? 'Importing data from CSV...' : 'Exporting data to CSV...'}
          </h3>
          {!importing && exportProgress.total > 0 && (
            <>
              <p className="text-gray-600 mb-4">
                Processing batch {exportProgress.current} of {exportProgress.total}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#352AA4] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {Math.round((exportProgress.current / exportProgress.total) * 100)}% Complete
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
