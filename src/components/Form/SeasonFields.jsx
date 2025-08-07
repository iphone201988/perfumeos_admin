import React from "react";
import FormField from "./FormField";

const SeasonFields = ({ form, onInputChange }) => {
  return (
    <div>
      <h4 className="text-[20px] font-medium mt-4 mb-4">Season</h4>
      <div className="grid grid-cols-2 gap-[16px] max-md:grid-cols-1">
        <FormField
          label="Winter"
          name="seasonWinter"
          value={form.seasonWinter}
          onChange={onInputChange}
          placeholder="Enter here"
        />
        <FormField
          label="Summer"
          name="seasonSummer"
          value={form.seasonSummer}
          onChange={onInputChange}
          placeholder="Enter here"
        />
        <FormField
          label="Autumn"
          name="seasonAutumn"
          value={form.seasonAutumn}
          onChange={onInputChange}
          placeholder="Enter here"
        />
        <FormField
          label="Spring"
          name="seasonSpring"
          value={form.seasonSpring}
          onChange={onInputChange}
          placeholder="Enter here"
        />
      </div>
    </div>
  );
};

export default SeasonFields;