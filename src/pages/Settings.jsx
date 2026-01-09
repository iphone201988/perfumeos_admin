// src/pages/Settings.jsx
import React, { useState } from 'react';
import PerfumeExportImport from '../components/Settings/PerfumeExportImport';
import NotesExportImport from '../components/Settings/NotesExportImport';
import PerfumersExportImport from '../components/Settings/PerfumersExportImport';
import BrandsExportImport from '../components/Settings/BrandsExportImport';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('perfumes');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
            <h1 className="text-[24px] font-bold text-[#352AA4]">Exports/Imports</h1>
          </div>
        </div>
      </div>

      {/* Settings Container */}
      <div className="bg-gradient-to-br from-[#E1F8F8] to-[#D4E8F8] rounded-[30px] shadow-lg overflow-hidden">
        <div className="bg-white/60 backdrop-blur-sm rounded-[30px] p-[32px] max-lg:p-[20px] m-[2px]">

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
            <button
              className={`pb-4 px-4 font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'perfumes'
                  ? 'border-b-2 border-[#352AA4] text-[#352AA4]'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('perfumes')}
            >
              🍾 Perfumes
            </button>
            <button
              className={`pb-4 px-4 font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'notes'
                  ? 'border-b-2 border-[#352AA4] text-[#352AA4]'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('notes')}
            >
              🌸 Notes
            </button>
            <button
              className={`pb-4 px-4 font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'perfumers'
                  ? 'border-b-2 border-[#352AA4] text-[#352AA4]'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('perfumers')}
            >
              👤 Perfumers
            </button>
            <button
              className={`pb-4 px-4 font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'brands'
                  ? 'border-b-2 border-[#352AA4] text-[#352AA4]'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('brands')}
            >
              🏢 Brands
            </button>
            {/* <button
              className={`pb-4 px-4 font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === 'general'
                  ? 'border-b-2 border-[#352AA4] text-[#352AA4]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('general')}
            >
              ⚙️ General
            </button> */}
          </div>

          {/* Tab Content */}
          {activeTab === 'perfumes' && <PerfumeExportImport />}
          {activeTab === 'notes' && <NotesExportImport />}
          {activeTab === 'perfumers' && <PerfumersExportImport />}
          {activeTab === 'brands' && <BrandsExportImport />}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                <h2 className="text-[20px] font-bold text-[#352AA4]">General Settings</h2>
              </div>

              <div className="text-center py-12">
                <p className="text-gray-500">Coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
