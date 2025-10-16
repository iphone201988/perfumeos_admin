// src/components/Settings/BatchSizeSelector.jsx
import React, { useMemo } from 'react';

const BatchSizeSelector = ({ 
  batchSize, 
  setBatchSize, 
  totalItems, 
  setSelectedBatches,
  itemName = 'items' // e.g., 'perfumes', 'notes', 'perfumers'
}) => {
  const totalBatches = useMemo(() => {
    return Math.ceil(totalItems / batchSize);
  }, [totalItems, batchSize]);

  const handleBatchSizeChange = (size) => {
    setBatchSize(size);
    setSelectedBatches([]);
  };

  const batchSizeOptions = [1000, 2000, 5000, 10000];

  return (
    <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-[#352AA4]/10">
      <div className="flex items-center gap-3 mb-4">
        <svg className="w-6 h-6 text-[#352AA4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <h3 className="text-lg font-bold text-gray-800">Batch Configuration</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Select how many records should be included in each batch
      </p>
      <div className="flex gap-3 flex-wrap">
        {batchSizeOptions.map((size) => (
          <button
            key={size}
            onClick={() => handleBatchSizeChange(size)}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              batchSize === size
                ? 'bg-[#352AA4] text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#352AA4]'
            }`}
          >
            {size.toLocaleString()} records
          </button>
        ))}
      </div>
      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 With {totalItems.toLocaleString()} {itemName} and batch size of {batchSize.toLocaleString()}, 
          this will create <strong>{totalBatches} batch(es)</strong>
        </p>
      </div>
    </div>
  );
};

export default BatchSizeSelector;
