// EditPerfume.jsx
import React, { useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetPerfumeByIdQuery,
  useUpdatePerfumeMutation,
  useGetNotesQuery,
  useGetPerfumersQuery,
} from "../../api";

import ImageUploader from "../Form/ImageUploader";
import FormField from "../Form/FormField";
import FragranceNotesSection from "../Form/FragranceNotesSection";
import SeasonFields from "../Form/SeasonFields";
import AccordsList from "./Accords/AccordsList";
import { usePerfumeForm } from "../../hooks/usePerfumeForm";
import CustomMultiSelect from "../Form/CustomMultiSelect";
import IntendedForMultiSelect from "../Form/IntendedForMultiSelect";

const EditPerfume = () => {
  const params = useParams();
  const navigate = useNavigate();

  // API hooks
  const { data: perfumeData, isLoading, error } = useGetPerfumeByIdQuery(params.id);
  const { data: notesResponse, isLoading: notesLoading } = useGetNotesQuery();
  const { data: perfumersResponse, isLoading: perfumersLoading } = useGetPerfumersQuery();
  const [updatePerfume, { isLoading: updating }] = useUpdatePerfumeMutation();

  const perfume = useMemo(() => perfumeData?.data || null, [perfumeData]);

  // Use custom hook for form management
  const {
    form,
    perfumerIds,
    fragranceTop,
    fragranceMiddle,
    fragranceBottom,
    fragranceNotes,
    mainAccords,
    isFormInitialized,
    setPerfumerIds,
    setFragranceTop,
    setFragranceMiddle,
    setFragranceBottom,
    setFragranceNotes,
    handleInputChange,
    handleAccordUpdate,
    handleAddAccord,
    handleRemoveAccord,
    onImageSelect,
    handleIntendedForChange
  } = usePerfumeForm(perfume);

  // Memoized options
  const noteOptions = useMemo(() => {
    if (!notesResponse?.data) return [];
    return notesResponse.data.map((note) => ({
      label: note.name,
      value: note._id,
      key: note._id,
    }));
  }, [notesResponse?.data]);

  const perfumerOptions = useMemo(() => {
    if (!perfumersResponse?.data) return [];
    return perfumersResponse.data.map((p) => ({
      label: p.name,
      value: p._id,
      key: p._id,
    }));
  }, [perfumersResponse?.data]);


  // Memoized selected values
  const selectedValues = useMemo(() => {
    const perfumerIdsSet = new Set(perfumerIds);
    const fragranceTopSet = new Set(fragranceTop);
    const fragranceMiddleSet = new Set(fragranceMiddle);
    const fragranceBottomSet = new Set(fragranceBottom);
    const fragranceNoteSet = new Set(fragranceNotes);

    return {
      selectedPerfumers: perfumerOptions.filter((option) => perfumerIdsSet.has(option.value)),
      selectedTopNotes: noteOptions.filter((option) => fragranceTopSet.has(option.value)),
      selectedMiddleNotes: noteOptions.filter((option) => fragranceMiddleSet.has(option.value)),
      selectedBottomNotes: noteOptions.filter((option) => fragranceBottomSet.has(option.value)),
      selectedNoteNotes: noteOptions.filter((option) => fragranceNoteSet.has(option.value)),
    };
  }, [perfumerOptions, noteOptions, perfumerIds, fragranceTop, fragranceMiddle, fragranceBottom, fragranceNotes]);

  // Handlers with optimization
  const handlePerfumerChange = useCallback((selectedOptions) => {
    const ids = selectedOptions.map((option) => option.value);
    setPerfumerIds(prevIds => {
      if (prevIds.length !== ids.length || !ids.every(id => prevIds.includes(id))) {
        return ids;
      }
      return prevIds;
    });
  }, [setPerfumerIds]);

  const handleTopNotesChange = useCallback((selectedOptions) => {
    const ids = selectedOptions.map((option) => option.value);
    setFragranceTop(prevIds => {
      if (prevIds.length !== ids.length || !ids.every(id => prevIds.includes(id))) {
        return ids;
      }
      return prevIds;
    });
  }, [setFragranceTop]);

  const handleMiddleNotesChange = useCallback((selectedOptions) => {
    const ids = selectedOptions.map((option) => option.value);
    setFragranceMiddle(prevIds => {
      if (prevIds.length !== ids.length || !ids.every(id => prevIds.includes(id))) {
        return ids;
      }
      return prevIds;
    });
  }, [setFragranceMiddle]);

  const handleBottomNotesChange = useCallback((selectedOptions) => {
    const ids = selectedOptions.map((option) => option.value);
    setFragranceBottom(prevIds => {
      if (prevIds.length !== ids.length || !ids.every(id => prevIds.includes(id))) {
        return ids;
      }
      return prevIds;
    });
  }, [setFragranceBottom]);

  const handleNoteNotesChange = useCallback((selectedOptions) => {
    const ids = selectedOptions.map((option) => option.value);
    setFragranceNotes(prevIds => {
      if (prevIds.length !== ids.length || !ids.every(id => prevIds.includes(id))) {
        return ids;
      }
      return prevIds;
    });
  }, [setFragranceNotes]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const updatedData = {
      name: form.name,
      brand: form.brand,
      category: form.category,
      year: form.yearRelease ? Number(form.yearRelease) : null,
      concentration: form.concentration,
      perfumers: perfumerIds,
      occasions: [
        { name: "day", width: form.occasionDay },
        { name: "night", width: form.occasionEvening },
      ],
      notes: {
        top: fragranceTop.map((id) => ({ noteId: id })),
        middle: fragranceMiddle.map((id) => ({ noteId: id })),
        base: fragranceBottom.map((id) => ({ noteId: id })),
      },
      seasons: [
        { name: "winter", width: form.seasonWinter },
        { name: "summer", width: form.seasonSummer },
        { name: "fall", width: form.seasonAutumn },
        { name: "spring", width: form.seasonSpring },
      ],
      mainAccords: mainAccords.map((accord) => ({
        name: accord.name,
        width: `${accord.width}%`,
        backgroundColor: accord.backgroundColor || "",
      })),
    };

    try {
      await updatePerfume({ id: params.id, ...updatedData }).unwrap();
      alert("Perfume updated successfully!");
      navigate(`/perfume/${params.id}`);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update perfume");
    }
  }, [form, perfumerIds, fragranceTop, fragranceMiddle, fragranceBottom, mainAccords, params.id, updatePerfume, navigate]);

  // Loading states
  if (isLoading || notesLoading || perfumersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Error loading perfume data</div>
      </div>
    );
  }

  if (!noteOptions.length || !perfumerOptions.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Preparing form...</div>
      </div>
    );
  }
  console.log("form", form)
  return (
    <div>
      <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
        <h6 className="text-[20px] font-semibold text-[#352AA4] mb-4">Edit Perfume</h6>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
          {/* Image + Major info */}
          <div className="flex gap-[20px] max-md:flex-wrap max-md:gap-[16px]">
            <ImageUploader onImageSelect={onImageSelect} currentImage={form.image} />
            <FormField
              label="Perfume Name"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Enter here"
              required
            />
            <FormField
              label="Perfume Brand Name"
              name="brand"
              value={form.brand}
              onChange={handleInputChange}
              placeholder="Enter here"
              required
            />
          </div>

          {/* Category / Year */}
          <div className="flex gap-[16px] max-md:flex-wrap">
            <IntendedForMultiSelect
              value={form.intendedFor}
              onChange={handleIntendedForChange}
            />
            {/* <FormField
              label="Perfume Category"
              name="category"
              type="select"
              value={form.category}
              onChange={handleInputChange}
            >
              <option value="Flora">Flora</option>
              <option value="Woody">Woody</option>
              <option value="Fresh">Fresh</option>
              <option value="Oriental">Oriental</option>
            </FormField> */}
            <FormField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="Enter here"
              textAera="true"
              rows="6"
            />
          </div>

          {/* Concentration / Occasions */}
          <div className="flex gap-[16px] max-md:flex-wrap">

            <FormField
              label="Concentration"
              name="concentration"
              value={form.concentration}
              onChange={handleInputChange}
              placeholder="Enter here"
            />
            <FormField
              label="Year Release"
              name="yearRelease"
              type="number"
              value={form.yearRelease}
              onChange={handleInputChange}
              min="1900"
              max={new Date().getFullYear()}
              placeholder="Enter here"
            />

          </div>
          <div className="flex gap-[16px] max-md:flex-wrap">

            <FormField
              label="Occasion (Day Time)"
              name="occasionDay"
              value={form.occasionDay}
              onChange={handleInputChange}
              placeholder="Enter here"
            />
            <FormField
              label="Occasion (Evening)"
              name="occasionEvening"
              value={form.occasionEvening}
              onChange={handleInputChange}
              placeholder="Enter here"
            />

          </div>
          {/* Season Fields */}
          <SeasonFields form={form} onInputChange={handleInputChange} />
          {/* Fragrance Notes Section */}
          <FragranceNotesSection
            noteOptions={noteOptions}
            perfumerOptions={perfumerOptions}
            selectedPerfumers={selectedValues.selectedPerfumers}
            selectedTopNotes={selectedValues.selectedTopNotes}
            selectedMiddleNotes={selectedValues.selectedMiddleNotes}
            selectedBottomNotes={selectedValues.selectedBottomNotes}
            selectedNoteNotes={selectedValues.selectedNoteNotes}
            onPerfumerChange={handlePerfumerChange}
            onTopNotesChange={handleTopNotesChange}
            onMiddleNotesChange={handleMiddleNotesChange}
            onBottomNotesChange={handleBottomNotesChange}
            onNoteNotesChange={handleNoteNotesChange}
          />



          {/* Main Accords */}
          <AccordsList
            accords={mainAccords}
            onUpdate={handleAccordUpdate}
            onAdd={handleAddAccord}
            onRemove={handleRemoveAccord}
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-[16px] mt-[24px] pt-4 border-t">
            <button
              type="button"
              className="btn-sec px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => alert("Remove Perfume function")}
            >
              Remove Perfume
            </button>
            <button
              type="submit"
              className="btn-pri px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={updating}
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPerfume;
