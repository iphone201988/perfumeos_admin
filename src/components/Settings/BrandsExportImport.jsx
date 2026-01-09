// src/components/Settings/BrandsExportImport.jsx
import React, { useState, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useGetBrandsStatsQuery, useExportBrandsBatchMutation, useImportBrandsMutation } from '../../api';
import LoadingOverlay from './LoadingOverlay';
import BatchSizeSelector from './BatchSizeSelector';
import BatchSelectorModal from './BatchSelectorModal';
import { deserializeComplexData, serializeComplexData, escapeCSV } from '../../utils/helperCsv';

const BrandsExportImport = () => {
    const [batchSize, setBatchSize] = useState(2000);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [showBatchSelector, setShowBatchSelector] = useState(false);
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });
    const fileInputRef = useRef(null);

    const { data: statsData } = useGetBrandsStatsQuery();
    const [exportBrandsBatch] = useExportBrandsBatchMutation();
    const [importBrands] = useImportBrandsMutation();

    const totalBrands = statsData?.data?.total || 0;
    const totalBatches = useMemo(() => Math.ceil(totalBrands / batchSize), [totalBrands, batchSize]);

    const csvHeaders = [
        'Name', 'Logo', 'Description', 'Founding Info', 'Country',
        'Website', 'Founding Year', 'Founder', 'General Info', 'Created At', '_id'
    ];

    const formatBrandRow = (brand) => [
        escapeCSV(brand.name),
        escapeCSV(brand.image),
        escapeCSV(brand.description),
        escapeCSV(brand.foundingInfo),
        escapeCSV(brand.country),
        escapeCSV(brand.website),
        escapeCSV(brand.foundingYear),
        escapeCSV(brand.founder),
        escapeCSV(brand.generalInfo),
        escapeCSV(brand.createdAt),
        escapeCSV(brand._id),
    ];

    const handleExportCSV = async () => {
        try {
            setExporting(true);
            const totalBatchesCalc = Math.ceil(totalBrands / batchSize);

            if (totalBatchesCalc === 0) {
                toast.warning('No brands to export');
                setExporting(false);
                return;
            }

            let csvRows = [csvHeaders.join(',')];

            for (let batch = 1; batch <= totalBatchesCalc; batch++) {
                setExportProgress({ current: batch, total: totalBatchesCalc });

                const response = await exportBrandsBatch({ page: batch, limit: batchSize }).unwrap();

                if (response.data && Array.isArray(response.data)) {
                    response.data.forEach(brand => {
                        csvRows.push(formatBrandRow(brand).join(','));
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
            link.download = `brands_export_${new Date().toISOString().split('T')[0]}_${csvRows.length - 1}_items.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(`Successfully exported ${csvRows.length - 1} brands!`);
            setExportProgress({ current: 0, total: 0 });
        } catch (error) {
            console.error('Export error:', error);
            toast.error(error?.data?.message || 'Failed to export brands');
            setExportProgress({ current: 0, total: 0 });
        } finally {
            setExporting(false);
        }
    };

    const handleImportCSV = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                setImporting(true);
                const text = e.target.result;
                const cleanText = text.replace(/^\uFEFF/, '');

                // Robust CSV Parser that handles quoted newlines
                const rows = [];
                let currentRow = [];
                let currentField = '';
                let inQuotes = false;

                for (let i = 0; i < cleanText.length; i++) {
                    const char = cleanText[i];
                    const nextChar = cleanText[i + 1];

                    if (char === '"') {
                        if (inQuotes && nextChar === '"') {
                            // Escaped quote
                            currentField += '"';
                            i++;
                        } else {
                            // Toggle quote mode
                            inQuotes = !inQuotes;
                        }
                    } else if (char === ',' && !inQuotes) {
                        // End of field
                        currentRow.push(currentField.trim());
                        currentField = '';
                    } else if ((char === '\n' || char === '\r') && !inQuotes) {
                        // End of row
                        if (currentField !== '' || currentRow.length > 0) {
                            currentRow.push(currentField.trim());
                            rows.push(currentRow);
                            currentRow = [];
                            currentField = '';
                        }
                        // Skip extra \n in \r\n
                        if (char === '\r' && nextChar === '\n') {
                            i++;
                        }
                    } else {
                        // Regular character
                        currentField += char;
                    }
                }

                // Add last record if exists
                if (currentField !== '' || currentRow.length > 0) {
                    currentRow.push(currentField.trim());
                    rows.push(currentRow);
                }

                if (rows.length < 2) {
                    toast.error('CSV file is empty or invalid');
                    setImporting(false);
                    return;
                }

                const dataRows = rows.slice(1); // Skip header

                const parsedBrands = dataRows.map((values, index) => {
                    try {
                        return {
                            name: values[0] || '',
                            image: values[1] || '',
                            description: values[2] || '',
                            foundingInfo: values[3] || '',
                            country: values[4] || '',
                            website: values[5] || '',
                            foundingYear: values[6] || '',
                            founder: values[7] || '',
                            generalInfo: values[8] || '',
                            _id: values[10] || '',
                        };
                    } catch (error) {
                        console.error(`Error parsing row ${index + 2}:`, error);
                        return null;
                    }
                }).filter(Boolean);

                if (parsedBrands.length === 0) {
                    toast.error('No valid brands found in CSV');
                    setImporting(false);
                    return;
                }

                const response = await importBrands({ brands: parsedBrands }).unwrap();

                toast.success(`Successfully imported ${response.imported} brands!`);

                if (response.failed > 0) {
                    toast.warning(`${response.failed} brands failed to import.`);
                }

                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } catch (error) {
                console.error('Import error:', error);
                toast.error(error?.data?.message || 'Failed to import brands');
            } finally {
                setImporting(false);
            }
        };

        reader.onerror = () => {
            toast.error('Failed to read file');
            setImporting(false);
        };

        reader.readAsText(file);
    };

    const handleDownloadSample = () => {
        const sampleData = [
            [
                'Chanel', 'https://example.com/chanel_logo.png', 'Iconic French luxury brand.', 'Founded in 1910 by Coco Chanel.', 'France',
                'https://chanel.com', '1910', 'Coco Chanel', 'Specializes in haute couture and luxury goods.',
                new Date().toISOString(), '123456789'
            ],
            [
                'Dior', 'https://example.com/dior_logo.png', 'Renowned French fashion house.', 'Founded in 1946 by Christian Dior.', 'France',
                'https://dior.com', '1946', 'Christian Dior', 'Known for revolutionized post-war fashion.',
                new Date().toISOString(), '987654321'
            ]
        ];

        const csvRows = [csvHeaders.join(',')];
        sampleData.forEach(row => {
            csvRows.push(row.map(cell => escapeCSV(cell)).join(','));
        });

        const csvContent = '\uFEFF' + csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = 'brands_sample_template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Sample CSV template downloaded!');
    };

    return (
        <div className="space-y-6">
            <LoadingOverlay isVisible={importing || exporting} importing={importing} exportProgress={exportProgress} />

            <BatchSelectorModal
                isOpen={showBatchSelector}
                onClose={() => {
                    setShowBatchSelector(false);
                    setSelectedBatches([]);
                }}
                batchSize={batchSize}
                totalItems={totalBrands}
                selectedBatches={selectedBatches}
                setSelectedBatches={setSelectedBatches}
                setExporting={setExporting}
                setExportProgress={setExportProgress}
                exportBatchMutation={exportBrandsBatch}
                dataType="brands"
                headers={csvHeaders}
                formatRowData={formatBrandRow}
            />

            <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                <h2 className="text-[20px] font-bold text-[#352AA4]">Brands Data Management</h2>
            </div>

            <BatchSizeSelector
                batchSize={batchSize}
                setBatchSize={setBatchSize}
                totalItems={totalBrands}
                setSelectedBatches={setSelectedBatches}
                itemName="brands"
            />

            {/* Export Section */}
            <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-[#352AA4]/10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Export All Brands</h3>
                        <p className="text-sm text-gray-600">Download as CSV file(s)</p>
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => setShowBatchSelector(true)}
                        disabled={exporting || totalBrands === 0}
                        className="bg-purple-600 text-white px-6 py-2.5 rounded-full hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Select Specific Batches
                    </button>
                </div>
                {totalBrands > 0 && (
                    <p className="text-xs text-gray-500 mt-3">
                        💡 Total: {totalBrands.toLocaleString()} brands • Batch Size: {batchSize.toLocaleString()} • Batches: {totalBatches}
                    </p>
                )}
            </div>

            {/* Import Section */}
            <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-[#352AA4]/10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Import Brands</h3>
                        <p className="text-sm text-gray-600">Upload CSV file</p>
                    </div>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {importing ? 'Importing...' : 'Import from CSV'}
                </button>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
            </div>

            {/* Sample Template */}
            <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Sample CSV Template</h3>
                        <p className="text-sm text-gray-600">Download example format</p>
                    </div>
                </div>
                <button
                    onClick={handleDownloadSample}
                    className="bg-purple-600 text-white px-6 py-2.5 rounded-full hover:bg-purple-700 transition-all duration-300 font-medium flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Sample CSV
                </button>
            </div>
        </div>
    );
};

export default BrandsExportImport;
