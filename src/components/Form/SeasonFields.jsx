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
                    type="number"
                    min="0"
                    max="100"
                    value={form.seasonWinter}
                    onChange={onInputChange}
                    placeholder="0-100"
                />
                <FormField
                    label="Summer"
                    name="seasonSummer"
                    type="number"
                    min="0"
                    max="100"
                    value={form.seasonSummer}
                    onChange={onInputChange}
                    placeholder="0-100"
                />
                <FormField
                    label="Autumn"
                    name="seasonAutumn"
                    type="number"
                    min="0"
                    max="100"
                    value={form.seasonAutumn}
                    onChange={onInputChange}
                    placeholder="0-100"
                />
                <FormField
                    label="Spring"
                    name="seasonSpring"
                    type="number"
                    min="0"
                    max="100"
                    value={form.seasonSpring}
                    onChange={onInputChange}
                    placeholder="0-100"
                />
            </div>
        </div>
    );
};

export default SeasonFields;