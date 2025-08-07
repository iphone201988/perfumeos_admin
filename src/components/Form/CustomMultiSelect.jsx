import React, { useState } from "react";

const CustomMultiSelect = ({ options, selected, onChange, placeholder }) => {
  const [search, setSearch] = useState("");

  // Filter options by search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  // Toggle option selection
  const toggleOption = (option) => {
    if (selected.some((sel) => sel.value === option.value)) {
      onChange(selected.filter((sel) => sel.value !== option.value));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="relative border border-gray-300 rounded p-2 bg-white max-w-full">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full p-1 mb-2 border rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div
        className="max-h-48 overflow-y-auto border rounded border-gray-200"
        style={{ minWidth: 200 }}
      >
        {filteredOptions.length === 0 ? (
          <div className="p-2 text-gray-500">No options</div>
        ) : (
          filteredOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100"
            >
              <input
                type="checkbox"
                checked={selected.some((sel) => sel.value === option.value)}
                onChange={() => toggleOption(option)}
              />
              <span>{option.label}</span>
            </label>
          ))
        )}
      </div>
      {/* Show selected items */}
      <div className="mt-1 flex flex-wrap gap-1">
        {selected.map((sel) => (
          <span
            key={sel.value}
            className="bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs"
          >
            {sel.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CustomMultiSelect;
