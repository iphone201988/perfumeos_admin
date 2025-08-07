import React from "react";
import CustomMultiSelect from "./CustomMultiSelect";

const FragranceNotesSection = ({
  noteOptions,
  selectedPerfumers,
  selectedTopNotes,
  selectedMiddleNotes,
  selectedBottomNotes,
  selectedNoteNotes,
  onPerfumerChange,
  onTopNotesChange,
  onMiddleNotesChange,
  onBottomNotesChange,
  onNoteNotesChange,
  perfumerOptions,
}) => {
  return (
    <>
      {/* Perfumer & Top Notes */}
      <div className="flex gap-[16px] max-md:flex-wrap max-lg:flex-wrap">
        <label className="flex flex-col w-full">
          <span className="text-[#7C7C7C] text-[14px] mb-1">Perfumer</span>
          <CustomMultiSelect
            options={perfumerOptions}
            selected={selectedPerfumers}
            onChange={onPerfumerChange}
            placeholder="Select perfumers"
            key="perfumer-select"
          />
        </label>
        <label className="flex flex-col w-full">
          <span className="text-[#7C7C7C] text-[14px] mb-1">Fragrance Pyramid (Top)</span>
          <CustomMultiSelect
            options={noteOptions}
            selected={selectedTopNotes}
            onChange={onTopNotesChange}
            placeholder="Select top notes"
            key="top-notes-select"
          />
        </label>
      </div>

      {/* Middle & Bottom Notes */}
      <div className="flex gap-[16px] max-md:flex-wrap">
        <label className="flex flex-col w-full">
          <span className="text-[#7C7C7C] text-[14px] mb-1">Fragrance Pyramid (Middle)</span>
          <CustomMultiSelect
            options={noteOptions}
            selected={selectedMiddleNotes}
            onChange={onMiddleNotesChange}
            placeholder="Select middle notes"
            key="middle-notes-select"
          />
        </label>
        <label className="flex flex-col w-full">
          <span className="text-[#7C7C7C] text-[14px] mb-1">Fragrance Pyramid (Bottom)</span>
          <CustomMultiSelect
            options={noteOptions}
            selected={selectedBottomNotes}
            onChange={onBottomNotesChange}
            placeholder="Select bottom notes"
            key="bottom-notes-select"
          />
        </label>
      </div>

      {/* Note Notes - Conditional */}
      {selectedNoteNotes?.length > 0 && (
        <div className="flex gap-[16px] max-md:flex-wrap">
          <label className="flex flex-col w-full">
            <span className="text-[#7C7C7C] text-[14px] mb-1">Fragrance Pyramid (Notes)</span>
            <CustomMultiSelect
              options={noteOptions}
              selected={selectedNoteNotes}
              onChange={onNoteNotesChange}
              placeholder="Select notes"
              key="note-notes-select"
            />
          </label>
        </div>
      )}
    </>
  );
};

export default FragranceNotesSection;