// src/components/Settings/BatchSelectorModal.jsx
import React, { useMemo } from 'react';
import { toast } from 'react-toastify';

const BatchSelectorModal = ({
  isOpen,
  onClose,
  batchSize,
  totalItems,
  selectedBatches,
  setSelectedBatches,
  setExporting,
  setExportProgress,
  exportBatchMutation,
  dataType = 'items',
  headers = [],
  formatRowData
}) => {
  const totalBatches = useMemo(() => {
    return Math.ceil(totalItems / batchSize);
  }, [totalItems, batchSize]);

  const batchOptions = useMemo(() => {
    const options = [];
    for (let i = 1; i <= totalBatches; i++) {
      const startRecord = (i - 1) * batchSize + 1;
      const endRecord = Math.min(i * batchSize, totalItems);
      options.push({
        batch: i,
        label: `Batch ${i} (Records ${startRecord} - ${endRecord})`,
        count: endRecord - startRecord + 1
      });
    }
    return options;
  }, [totalBatches, batchSize, totalItems]);

  const handleBatchToggle = (batchNumber) => {
    setSelectedBatches(prev => {
      if (prev.includes(batchNumber)) {
        return prev.filter(b => b !== batchNumber);
      } else {
        return [...prev, batchNumber].sort((a, b) => a - b);
      }
    });
  };

  const handleSelectAllBatches = () => {
    if (selectedBatches.length === totalBatches) {
      setSelectedBatches([]);
    } else {
      setSelectedBatches(Array.from({ length: totalBatches }, (_, i) => i + 1));
    }
  };

  const handleExportSelectedBatches = async () => {
    if (selectedBatches.length === 0) {
      toast.warning('Please select at least one batch to export');
      return;
    }

    try {
      setExporting(true);
      let allRows = [headers.join(',')];
      let totalExported = 0;

      for (let i = 0; i < selectedBatches.length; i++) {
        const batchNumber = selectedBatches[i];
        setExportProgress({ current: i + 1, total: selectedBatches.length });

        const response = await exportBatchMutation({
          page: batchNumber,
          limit: batchSize
        }).unwrap();

        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(item => {
            const row = formatRowData(item);
            allRows.push(row.join(','));
          });
          totalExported += response.data.length;
        }

        if (i < selectedBatches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      const csvContent = '\uFEFF' + allRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      const batchNumbers = selectedBatches.join('_');
      link.href = url;
      link.download = `${dataType}_batches_${batchNumbers}_${totalExported}_items.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${totalExported} ${dataType} from ${selectedBatches.length} batch(es)!`);
      setExportProgress({ current: 0, total: 0 });
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error?.data?.message || `Failed to export ${dataType}`);
      setExportProgress({ current: 0, total: 0 });
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm flex items-center justify-center z-[9998] p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl transform transition-all duration-300 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Gradient */}
        <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-[#352AA4] to-[#4A3BC5] text-white overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold">Select Batches to Export</h3>
                </div>
                <p className="text-white/90 text-sm font-medium ml-14">
                  Choose which data batches you want to export to CSV
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
              >
                <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3.5 border border-white/20">
                <div className="text-white/80 text-xs font-medium mb-1">Batch Size</div>
                <div className="text-2xl font-bold">{batchSize.toLocaleString()}</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3.5 border border-white/20">
                <div className="text-white/80 text-xs font-medium mb-1">Total Batches</div>
                <div className="text-2xl font-bold">{totalBatches}</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3.5 border border-white/20">
                <div className="text-white/80 text-xs font-medium mb-1">Total Items</div>
                <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="px-8 py-5 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAllBatches}
                className="group flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#352AA4] text-[#352AA4] rounded-xl hover:bg-[#352AA4] hover:text-white transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={selectedBatches.length === totalBatches ? "M6 18L18 6M6 6l12 12" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                </svg>
                {selectedBatches.length === totalBatches ? 'Deselect All' : 'Select All'}
              </button>
              
              {selectedBatches.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#352AA4]/10 rounded-xl border border-[#352AA4]/20 animate-fadeIn">
                  <div className="w-2 h-2 bg-[#352AA4] rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-[#352AA4]">
                    {selectedBatches.length} {selectedBatches.length === 1 ? 'batch' : 'batches'} selected
                  </span>
                </div>
              )}
            </div>
            
            {selectedBatches.length > 0 && (
              <div className="text-sm text-gray-600 font-medium">
                ~{(selectedBatches.length * batchSize).toLocaleString()} items
              </div>
            )}
          </div>
        </div>

        {/* Modal Body - Scrollable Batch Grid */}
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-gradient-to-b from-white to-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batchOptions.map((option, index) => (
              <label
                key={option.batch}
                className={`group relative flex items-start gap-3.5 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  selectedBatches.includes(option.batch)
                    ? 'border-[#352AA4] bg-gradient-to-br from-[#352AA4]/10 to-[#352AA4]/5 shadow-md'
                    : 'border-gray-200 bg-white hover:border-[#352AA4]/40 hover:bg-gray-50'
                }`}
                style={{ animationDelay: `${index * 20}ms` }}
              >
                {/* Checkbox Container */}
                <div className="relative flex items-center justify-center flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={selectedBatches.includes(option.batch)}
                    onChange={() => handleBatchToggle(option.batch)}
                    className="w-5 h-5 text-[#352AA4] bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-[#352AA4] focus:ring-offset-2 cursor-pointer transition-all"
                  />
                  {selectedBatches.includes(option.batch) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg className="w-3 h-3 text-white animate-scaleIn" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Batch Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-lg transition-colors ${
                      selectedBatches.includes(option.batch)
                        ? 'bg-[#352AA4] text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-[#352AA4]/20 group-hover:text-[#352AA4]'
                    }`}>
                      {option.batch}
                    </span>
                    <p className="font-bold text-gray-800 text-sm">Batch {option.batch}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-medium">Records {option.batch === 1 ? '1' : ((option.batch - 1) * batchSize + 1).toLocaleString()} - {Math.min(option.batch * batchSize, totalItems).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                        selectedBatches.includes(option.batch)
                          ? 'bg-[#352AA4]/20 text-[#352AA4]'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {option.count.toLocaleString()} {dataType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedBatches.includes(option.batch) && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#352AA4] rounded-full flex items-center justify-center shadow-lg animate-scaleIn">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Modal Footer with Enhanced Buttons */}
        <div className="px-8 py-6 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              {selectedBatches.length > 0 ? (
                <span className="font-medium">
                  Ready to export <span className="text-[#352AA4] font-bold">{selectedBatches.length}</span> batch{selectedBatches.length !== 1 ? 'es' : ''}
                </span>
              ) : (
                <span>Select batches to continue</span>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-7 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold shadow-sm hover:shadow"
              >
                Cancel
              </button>
              <button
                onClick={handleExportSelectedBatches}
                disabled={selectedBatches.length === 0}
                className="px-7 py-3 bg-gradient-to-r from-[#352AA4] to-[#4A3BC5] text-white rounded-full hover:shadow-xl transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2.5 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#4A3BC5] to-[#352AA4] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <svg className="w-5 h-5 relative z-10 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="relative z-10">
                  Export {selectedBatches.length > 0 ? `${selectedBatches.length} Batch${selectedBatches.length !== 1 ? 'es' : ''}` : ''}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default BatchSelectorModal;
