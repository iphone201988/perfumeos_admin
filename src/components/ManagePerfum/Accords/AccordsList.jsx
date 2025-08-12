import React, { useCallback } from "react";
import AccordItem from "./AccordItem";

const AccordsList = ({ accords, onUpdate, onAdd, onRemove }) => {
  const handleAddAccord = useCallback(() => {
    onAdd();
  }, [onAdd]);

  return (
    <div className="flex flex-col gap-[12px]">
      <h4 className="text-[20px] font-medium">Main Accords</h4>
      
      {accords.length === 0 ? (
        <div className="text-gray-500 text-center py-8 border-1 bg-white border-dashed border-[#eeeeee] rounded-[16px]">
          No accords added yet. Click the button below to add your first accord.
        </div>
      ) : (
        accords.map((accord, idx) => (
          <AccordItem
            key={accord.id}
            accord={accord}
            index={idx}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))
      )}

      <button
        type="button"
        onClick={handleAddAccord}
        className="self-start btn-sec px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors"
      >
        + Add accord
      </button>
    </div>
  );
};

export default AccordsList;