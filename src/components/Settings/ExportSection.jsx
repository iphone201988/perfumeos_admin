// src/components/Settings/ExportSection.jsx
import React, { useMemo } from 'react';
import { toast } from 'react-toastify';
import { useExportPerfumesBatchMutation } from '../../api';
import { escapeCSV, serializeComplexData } from '../../utils/helperCsv';

const ExportSection = ({
  batchSize,
  totalPerfumes,
  exporting,
  setExporting,
  setExportProgress,
  setShowBatchSelector
}) => {
  const [exportPerfumesBatch] = useExportPerfumesBatchMutation();

  const totalBatches = useMemo(() => {
    return Math.ceil(totalPerfumes / batchSize);
  }, [totalPerfumes, batchSize]);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const totalBatchesCalc = Math.ceil(totalPerfumes / batchSize);

      if (totalBatchesCalc === 0) {
        toast.warning('No perfumes to export');
        setExporting(false);
        return;
      }

      const headers = [
        'Name', 'Brand', 'Image','Concentration', 'Description', 'Year',
        'Intended For', 'Seasons', 'Occasions', 'Occasion Day Votes',
        'Occasion Night Votes', 'Main Accords', 'Perfumers',
        'Top Notes', 'Middle Notes', 'Base Notes', 'Other Notes', 'Created At'
      ];

      let csvRows = [headers.join(',')];

      for (let batch = 1; batch <= totalBatchesCalc; batch++) {
        setExportProgress({ current: batch, total: totalBatchesCalc });

        const response = await exportPerfumesBatch({
          page: batch,
          limit: batchSize
        }).unwrap();

        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(perfume => {
            const row = [
              escapeCSV(perfume.name),
              escapeCSV(perfume.brand),
              escapeCSV(perfume.image),
              escapeCSV(perfume.concentration),
              escapeCSV(perfume.description),
              escapeCSV(perfume.year),
              escapeCSV(serializeComplexData(perfume.intendedFor)),
              escapeCSV(serializeComplexData(perfume.seasons)),
              escapeCSV(serializeComplexData(perfume.occasions)),
              escapeCSV(perfume.occasionVotes?.day || 0),
              escapeCSV(perfume.occasionVotes?.night || 0),
              escapeCSV(serializeComplexData(perfume.mainAccords)),
              escapeCSV(serializeComplexData(perfume.perfumers)),
              escapeCSV(serializeComplexData(perfume.notes?.top)),
              escapeCSV(serializeComplexData(perfume.notes?.middle)),
              escapeCSV(serializeComplexData(perfume.notes?.base)),
              escapeCSV(serializeComplexData(perfume.notes?.notes)),
              escapeCSV(perfume.createdAt)
            ];
            csvRows.push(row.join(','));
          });
        }

        if (batch < totalBatchesCalc) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      const csvContent = '\uFEFF' + csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `perfumes_export_${new Date().toISOString().split('T')[0]}_${csvRows.length - 1}_items.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${csvRows.length - 1} perfumes!`);
      setExportProgress({ current: 0, total: 0 });
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error?.data?.message || 'Failed to export perfumes');
      setExportProgress({ current: 0, total: 0 });
    } finally {
      setExporting(false);
    }
  };

  const handleExportMultipleCSV = async () => {
    try {
      setExporting(true);
      const totalBatchesCalc = Math.ceil(totalPerfumes / batchSize);

      if (totalBatchesCalc === 0) {
        toast.warning('No perfumes to export');
        setExporting(false);
        return;
      }

      const headers = [
        'Name', 'Brand', 'Image', 'Concentration', 'Description', 'Year',
        'Intended For', 'Seasons', 'Occasions', 'Occasion Day Votes',
        'Occasion Night Votes', 'Main Accords', 'Perfumers',
        'Top Notes', 'Middle Notes', 'Base Notes', 'Other Notes', 'Created At'
      ];

      let exportedCount = 0;

      for (let batch = 1; batch <= totalBatchesCalc; batch++) {
        setExportProgress({ current: batch, total: totalBatchesCalc });

        const response = await exportPerfumesBatch({
          page: batch,
          limit: batchSize
        }).unwrap();

        if (response.data && Array.isArray(response.data)) {
          let csvRows = [headers.join(',')];

          response.data.forEach(perfume => {
            const row = [
              escapeCSV(perfume.name),
              escapeCSV(perfume.brand),
              escapeCSV(perfume.image),
              escapeCSV(perfume.concentration),
              escapeCSV(perfume.description),
              escapeCSV(perfume.year),
              escapeCSV(serializeComplexData(perfume.intendedFor)),
              escapeCSV(serializeComplexData(perfume.seasons)),
              escapeCSV(serializeComplexData(perfume.occasions)),
              escapeCSV(perfume.occasionVotes?.day || 0),
              escapeCSV(perfume.occasionVotes?.night || 0),
              escapeCSV(serializeComplexData(perfume.mainAccords)),
              escapeCSV(serializeComplexData(perfume.perfumers)),
              escapeCSV(serializeComplexData(perfume.notes?.top)),
              escapeCSV(serializeComplexData(perfume.notes?.middle)),
              escapeCSV(serializeComplexData(perfume.notes?.base)),
              escapeCSV(serializeComplexData(perfume.notes?.notes)),
              escapeCSV(perfume.createdAt)
            ];
            csvRows.push(row.join(','));
          });

          const csvContent = '\uFEFF' + csvRows.join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');

          link.href = url;
          link.download = `perfumes_batch_${batch}_of_${totalBatchesCalc}_${response.data.length}_items.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          exportedCount += response.data.length;
        }

        if (batch < totalBatchesCalc) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast.success(`Successfully exported ${exportedCount} perfumes in ${totalBatchesCalc} files!`);
      setExportProgress({ current: 0, total: 0 });
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error?.data?.message || 'Failed to export perfumes');
      setExportProgress({ current: 0, total: 0 });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-[#352AA4]/10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Export All Perfumes</h3>
              <p className="text-sm text-gray-600">Download as CSV file(s)</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Export all perfumes with complete data in CSV format. Processed in batches of {batchSize.toLocaleString()} items.
          </p>
          <div className="flex gap-3 flex-wrap">
            {/* <button
              onClick={handleExportCSV}
              disabled={exporting || totalPerfumes === 0}
              className="bg-green-600 text-white px-6 py-2.5 rounded-full hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {exporting ? 'Exporting...' : 'Export Single CSV'}
            </button>

            <button
              onClick={handleExportMultipleCSV}
              disabled={exporting || totalPerfumes === 0}
              className="bg-teal-600 text-white px-6 py-2.5 rounded-full hover:bg-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              Export Multiple CSVs
            </button> */}

            <button
              onClick={() => setShowBatchSelector(true)}
              disabled={exporting || totalPerfumes === 0}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-full hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Select Specific Batches
            </button>
          </div>
          {totalBatches > 1 && (
            <p className="text-xs text-gray-500 mt-3">
              💡 With {totalPerfumes.toLocaleString()} perfumes and batch size {batchSize.toLocaleString()}, 
              this will create {totalBatches} CSV file(s)
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportSection;
