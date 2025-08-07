// components/Form/IntendedForMultiSelect.jsx
import React, { useMemo } from "react";
import CustomMultiSelect from "./CustomMultiSelect";

const IntendedForMultiSelect = ({ value = [], onChange }) => {
  const options = useMemo(() => [
    { label: "Men", value: "men", key: "men" },
    { label: "Women", value: "women", key: "women" },
  ], []);

  const selectedOptions = useMemo(() => 
    options.filter(option => value.includes(option.value)),
    [options, value]
  );

  const handleChange = (selectedOptions) => {
    const values = selectedOptions.map(option => option.value);
    onChange(values);
  };

  return (
    <label className="flex flex-col w-full">
      <span className="text-[#7C7C7C] text-[14px] mb-1">Intended For</span>
      <CustomMultiSelect
        options={options}
        selected={selectedOptions}
        onChange={handleChange}
        placeholder="Select target audience"
        key="intended-for-select"
      />
    </label>
  );
};

export default IntendedForMultiSelect;

