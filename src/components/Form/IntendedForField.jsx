// components/Form/IntendedForField.jsx
import React from "react";

const IntendedForField = ({ value = [], onChange }) => {
  const options = [
    { label: "Men", value: "men" },
    { label: "Women", value: "women" },
    { label: "Unisex", value: "unisex" }
  ];

  const handleCheckboxChange = (optionValue) => {
    const currentValues = Array.isArray(value) ? value : [];
    
    if (currentValues.includes(optionValue)) {
      // Remove if already selected
      const newValues = currentValues.filter(item => item !== optionValue);
      onChange(newValues);
    } else {
      // Add if not selected
      const newValues = [...currentValues, optionValue];
      onChange(newValues);
    }
  };

  return (
    <label className="flex flex-col w-full">
      <span className="text-[#7C7C7C] text-[14px] mb-1">Intended For</span>
      <div className="bg-white border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] focus-within:ring-2 focus-within:ring-blue-500">
        <div className="flex flex-wrap gap-4">
          {options.map((option) => (
            <label 
              key={option.value} 
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => handleCheckboxChange(option.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700 select-none">{option.label}</span>
            </label>
          ))}
        </div>
        
        {/* Display selected values */}
        {value.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex flex-wrap gap-1">
              {value.map((selectedValue) => {
                const option = options.find(opt => opt.value === selectedValue);
                return (
                  <span 
                    key={selectedValue}
                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {option?.label}
                    <button
                      type="button"
                      onClick={() => handleCheckboxChange(selectedValue)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </label>
  );
};

export default IntendedForField;
