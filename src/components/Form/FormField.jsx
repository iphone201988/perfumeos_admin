import React from "react";

const FormField = React.memo(
  ({ label, name, type = "text", value, onChange, className = "", textArea = false, error = null, required = false, ...props }) => (
    <label className={`flex flex-col w-full ${className}`}>
      <span className="text-[#7C7C7C] text-[14px] mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </span>

      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`bg-white border rounded-2xl py-[14px] px-[18px] focus:outline-none focus:ring-2 transition-colors ${error ? "border-red-500 focus:ring-red-200" : "border-[#EEEEEE] focus:ring-blue-500"
            }`}
          {...props}
        >
          {props.children}
        </select>
      ) : textArea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          className={`bg-white border rounded-2xl py-[14px] px-[18px] focus:outline-none focus:ring-2 transition-colors resize-none ${error ? "border-red-500 focus:ring-red-200" : "border-[#EEEEEE] focus:ring-blue-500"
            }`}
          {...props}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={`bg-white border rounded-2xl py-[14px] px-[18px] focus:outline-none focus:ring-2 transition-colors ${error ? "border-red-500 focus:ring-red-200" : "border-[#EEEEEE] focus:ring-blue-500"
            }`}
          {...props}
        />
      )}
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </label>
  )
);

FormField.displayName = "FormField";
export default FormField;
