import React from "react";

const FormField = React.memo(
  ({ label, name, type = "text", value, onChange, className = "", textAera = false, ...props }) => (
    <label className={`flex flex-col w-full ${className}`}>
      <span className="text-[#7C7C7C] text-[14px] mb-1">{label}</span>

      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="bg-white border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...props}
        >
          {props.children}
        </select>
      ) : textAera=="true" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          className="bg-white border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          {...props}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className="bg-white border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...props}
        />
      )}
    </label>
  )
);

FormField.displayName = "FormField";
export default FormField;
