import React from "react";
import FormField from "./FormField";

const SeasonFields = ({ 
    form, 
    onInputChange, 
    onBlur, 
    formErrors = {}, 
    touched = {} 
}) => {
    return (
        <div>
            <h4 className="text-[20px] font-medium mt-4 mb-4">Season</h4>
            <div className="grid grid-cols-2 gap-[16px] max-md:grid-cols-1">
                <FormField
                    label="Winter"
                    name="seasonWinter"
                    type="number"
                    value={form.seasonWinter}
                    onChange={onInputChange}
                    onBlur={onBlur}
                    placeholder="0-100"
                    error={touched.seasonWinter && formErrors.seasonWinter}
                />
                <FormField
                    label="Summer"
                    name="seasonSummer"
                    type="number"
                    value={form.seasonSummer}
                    onChange={onInputChange}
                    onBlur={onBlur}
                    placeholder="0-100"
                    error={touched.seasonSummer && formErrors.seasonSummer}
                />
                <FormField
                    label="Autumn"
                    name="seasonAutumn"
                    type="number"
                    value={form.seasonAutumn}
                    onChange={onInputChange}
                    onBlur={onBlur}
                    placeholder="0-100"
                    error={touched.seasonAutumn && formErrors.seasonAutumn}
                />
                <FormField
                    label="Spring"
                    name="seasonSpring"
                    type="number"
                    value={form.seasonSpring}
                    onChange={onInputChange}
                    onBlur={onBlur}
                    placeholder="0-100"
                    error={touched.seasonSpring && formErrors.seasonSpring}
                />
            </div>
        </div>
    );
};

export default SeasonFields;
