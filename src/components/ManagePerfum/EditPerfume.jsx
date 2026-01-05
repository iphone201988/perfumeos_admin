import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useGetNotesQuery, useGetPerfumeForEditByIdQuery, useGetPerfumersQuery, useUpdatePerfumeMutation } from "../../api";
import MultipleImageUploader from "../Form/MultipleImageUploader";
import FormField from "../Form/FormField";
import { useNavigate, useParams } from "react-router-dom";
import IntendedForMultiSelect from "../Form/IntendedForMultiSelect";
import SeasonFields from "../Form/SeasonFields";
import AccordsList from "./Accords/AccordsList";
import { hexToRgb, rgbToHex } from "../../Utils/function";
import Select from 'react-select';
import Loader from "../Loader/Loader";
import { toast } from "react-toastify";

const customFilterOption = (option, rawInput) => {
  if (!rawInput) return true;
  const label = option.label.toLowerCase();
  const input = rawInput.toLowerCase();
  return label.startsWith(input);
};

const EditPerfume = () => {
  const params = useParams();
  const navigate = useNavigate();

  const { data: perfumeData, isLoading, error } = useGetPerfumeForEditByIdQuery(params.id);
  const { data: notesResponse, isLoading: notesLoading } = useGetNotesQuery();
  const { data: perfumersResponse, isLoading: perfumersLoading } = useGetPerfumersQuery();
  const perfume = useMemo(() => perfumeData?.data || null, [perfumeData]);
  const [updating, setUpdating] = useState(false);
  const [updatePerfume, { isLoading: updateLoading }] = useUpdatePerfumeMutation();

  // Multiple images state
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageError, setImageError] = useState('');

  // Add validation states
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [form, setForm] = useState({
    name: "",
    brand: "",
    intendedFor: [],
    description: "",
    yearRelease: "",
    concentration: "",
    // occasionDay: "",
    // occasionEvening: "",
    // seasonWinter: "",
    // seasonSummer: "",
    // seasonAutumn: "",
    // seasonSpring: "",
  });

  const [mainAccords, setMainAccords] = useState([]);
  const [perfumerIds, setPerfumerIds] = useState([]);
  const [fragranceTop, setFragranceTop] = useState([]);
  const [fragranceMiddle, setFragranceMiddle] = useState([]);
  const [fragranceBottom, setFragranceBottom] = useState([]);
  const [fragranceNotes, setFragranceNotes] = useState([]);

  // Validation rules
  const validateField = useCallback((name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value || value.trim() === '') {
          error = 'Perfume name is required';
        } else if (value.trim().length < 2) {
          error = 'Perfume name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          error = 'Perfume name must be less than 100 characters';
        }
        break;

      case 'brand':
        if (!value || value.trim() === '') {
          // error = 'Brand name is required';
        } else if (value.trim().length < 2) {
          // error = 'Brand name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          // error = 'Brand name must be less than 50 characters';
        }
        break;

      case 'description':
        if (!value || value.trim() === '') {
          // error = 'Description is required';
        } else if (value.trim().length < 10) {
          // error = 'Description must be at least 10 characters';
        } else if (value.trim().length > 100000) {
          // error = 'Description must be less than 100000 characters';
        }
        break;

      case 'yearRelease':
        const currentYear = new Date().getFullYear();
        const yearNum = parseInt(value);
        if (!value) {
        } else if (isNaN(yearNum) || yearNum < 1900) {
          error = 'Year must be 1900 or later';
        } else if (yearNum > currentYear) {
          error = `Year cannot be later than ${currentYear}`;
        }
        break;

      // case 'occasionDay':
      // case 'occasionEvening':
      //   const occasionNum = parseInt(value);
      //   if (value !== '' && (isNaN(occasionNum) || occasionNum < 0 || occasionNum > 100)) {
      //     error = 'Value must be between 0 and 100';
      //   }
      //   break;

      default:
        break;
    }

    return error;
  }, []);

  // Validate entire form
  const validateForm = useCallback(() => {
    const errors = {};

    // Validate basic fields
    Object.keys(form).forEach(field => {
      if (field !== 'intendedFor') {
        const error = validateField(field, form[field]);
        if (error) errors[field] = error;
      }
    });

    // Validate intended for
    if (!form.intendedFor || form.intendedFor.length === 0) {
      errors.intendedFor = 'Please select at least one intended audience';
    }

    // Validate occasion totals
    // const occasionTotal = parseInt(form.occasionDay || 0) + parseInt(form.occasionEvening || 0);
    // if (occasionTotal > 100) {
    //   errors.occasions = 'Total occasion percentages cannot exceed 100%';
    // }

    // Validate images
    if (images.length === 0) {
      // errors.images = 'At least one image is required';
    }

    return errors;
  }, [form, validateField, images]);

  useEffect(() => {
    if (perfume && perfumersResponse?.data && notesResponse?.data) {
      setMainAccords((perfume.mainAccords || []).map((a, index) => ({
        ...a,
        backgroundColor: rgbToHex(a.backgroundColor || "#000000"),
        width: a.width?.split("%")[0],
        id: index,
      })) || []);

      const formData = {
        name: perfume.name || "",
        brand: perfume.brand || "",
        description: perfume.description || "",
        intendedFor: perfume.intendedFor || [],
        yearRelease: perfume.year || "",
        concentration: perfume.concentration || "",
        // occasionDay: ((perfume?.occasionVotes?.day * 100) / perfume?.occasionVotes?.total) || "",
        // occasionEvening: ((perfume?.occasionVotes?.night * 100) / perfume?.occasionVotes?.total) || "",
        // seasonWinter: perfume.seasons?.find((s) => s.name === "winter")?.width.split("%")[0] || "",
        // seasonSummer: perfume.seasons?.find((s) => s.name === "summer")?.width.split("%")[0] || "",
        // seasonAutumn: perfume.seasons?.find((s) => s.name === "fall")?.width.split("%")[0] || "",
        // seasonSpring: perfume.seasons?.find((s) => s.name === "spring")?.width.split("%")[0] || "",
      };

      setForm(formData);

      // Load existing images
      const existingImages = [];

      // Add primary image if exists
      if (perfume.image) {
        existingImages.push({
          url: perfume.image,
          file: null,
          id: `existing-${Date.now()}-0`,
          isExisting: true
        });
      }

      // Add additional images if exist
      if (perfume.images && perfume.images.length > 0) {
        perfume.images
          .filter(img => img !== perfume.image) // Avoid adding the primary image again
          .forEach((img, idx) => {
            existingImages.push({
              url: img,
              file: null,
              id: `existing-${idx + 1}`,  // Use timestamp and index
              isExisting: true
            });
          });
      }

      setImages(existingImages);

      // Convert perfumer IDs to react-select format
      const perfumerIdList = Array.isArray(perfume.perfumers)
        ? perfume.perfumers.map((p) => p.perfumerId || p._id)
        : [];
      const selectedPerfumers = perfumerIdList.map(id => {
        const perfumer = perfumersResponse.data.find(p => p._id === id);
        return perfumer ? { value: perfumer._id, label: perfumer.name } : null;
      }).filter(Boolean);

      // Convert note IDs to react-select format
      const topNotes = perfume.notes?.top?.map((n) => {
        const note = notesResponse.data.find(note => note._id === (n.noteId || n._id));
        return note ? { value: note._id, label: note.name } : null;
      }).filter(Boolean) || [];

      const middleNotes = perfume.notes?.middle?.map((n) => {
        const note = notesResponse.data.find(note => note._id === (n.noteId || n._id));
        return note ? { value: note._id, label: note.name } : null;
      }).filter(Boolean) || [];

      const baseNotes = perfume.notes?.base?.map((n) => {
        const note = notesResponse.data.find(note => note._id === (n.noteId || n._id));
        return note ? { value: note._id, label: note.name } : null;
      }).filter(Boolean) || [];

      const noteNotes = perfume.notes?.note?.map((n) => {
        const note = notesResponse.data.find(note => note._id === (n.noteId || n._id));
        return note ? { value: note._id, label: note.name } : null;
      }).filter(Boolean) || [];

      setPerfumerIds(selectedPerfumers);
      setFragranceTop(topNotes);
      setFragranceMiddle(middleNotes);
      setFragranceBottom(baseNotes);
      setFragranceNotes(noteNotes);

      // Clear any existing errors when loading data
      setFormErrors({});
      setTouched({});
      setImageError('');
    }
  }, [perfume, perfumersResponse?.data, notesResponse?.data]);

  // Convert data to react-select format
  const noteOptions = useMemo(() => {
    if (!notesResponse?.data) return [];
    return notesResponse.data.map((note) => ({
      value: note._id,
      label: note.name,
    }));
  }, [notesResponse?.data]);

  const perfumerOptions = useMemo(() => {
    if (!perfumersResponse?.data) return [];
    return perfumersResponse.data.map((p) => ({
      value: p._id,
      label: p.name,
    }));
  }, [perfumersResponse?.data]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate field and update errors
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [validateField]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, form[name]);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [validateField, form]);

  // Handle multiple images change
  const handleImagesChange = useCallback((imageArray, files, error) => {
    if (error) {
      setImageError(error);
      setFormErrors(prev => ({ ...prev, images: error }));
      return;
    }

    setImages(imageArray);

    // Filter only new files (not existing images)
    const newFiles = imageArray
      .filter(img => img.file !== null)
      .map(img => img.file);

    setImageFiles(newFiles);
    setImageError('');
    setFormErrors(prev => ({ ...prev, images: '' }));
  }, []);

  const handleIntendedForChange = useCallback((newValues) => {
    const values = Array.isArray(newValues) ? newValues : [newValues];
    setForm((prev) => ({ ...prev, intendedFor: values }));

    if (values.length > 0) {
      setFormErrors(prev => ({ ...prev, intendedFor: '' }));
    }
  }, []);

  const handleAccordUpdate = useCallback((idx, field, value) => {
    setMainAccords((prev) => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        [field]: field === "backgroundColor" ? rgbToHex(value) : value,
      };
      return updated;
    });

    setFormErrors(prev => ({ ...prev, accords: '' }));
  }, []);

  // React-select change handlers with validation
  const onPerfumerChange = useCallback((selectedOptions) => {
    setPerfumerIds(selectedOptions || []);
    if (selectedOptions && selectedOptions.length > 0) {
      setFormErrors(prev => ({ ...prev, perfumers: '' }));
    }
  }, []);

  const onTopNotesChange = useCallback((selectedOptions) => {
    setFragranceTop(selectedOptions || []);
    setFormErrors(prev => ({ ...prev, notes: '' }));
  }, []);

  const onMiddleNotesChange = useCallback((selectedOptions) => {
    setFragranceMiddle(selectedOptions || []);
    setFormErrors(prev => ({ ...prev, notes: '' }));
  }, []);

  const onBottomNotesChange = useCallback((selectedOptions) => {
    setFragranceBottom(selectedOptions || []);
    setFormErrors(prev => ({ ...prev, notes: '' }));
  }, []);

  const onNoteNotesChange = useCallback((selectedOptions) => {
    setFragranceNotes(selectedOptions || []);
    setFormErrors(prev => ({ ...prev, notes: '' }));
  }, []);

  const handleAddAccord = useCallback(() => {
    setMainAccords((prev) => [
      ...prev,
      {
        name: "",
        width: 50,
        backgroundColor: "#000000",
        id: prev.length,
      },
    ]);
  }, []);

  const handleRemoveAccord = useCallback((idx) => {
    setMainAccords((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validate entire form
    const errors = validateForm();
    setFormErrors(errors);

    // Mark all fields as touched to show errors
    const allTouched = {};
    Object.keys(form).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix all validation errors before updating");
      return;
    }

    const formData = new FormData();

    // Basic fields
    formData.append('name', form.name);
    formData.append('brand', form.brand);
    formData.append('description', form.description);
    formData.append('year', form.yearRelease);
    formData.append('concentration', form.concentration);

    // Handle multiple image files upload (only new files)
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((imgFile) => {
        formData.append('images', imgFile);
      });
    }

    // Send existing image URLs to preserve them
    const existingImageUrls = images
      .filter(img => img.isExisting)
      .map(img => img.url);

    formData.append('existingImages', JSON.stringify(existingImageUrls));

    // Complex objects as JSON strings
    formData.append('intendedFor', JSON.stringify(form.intendedFor));
    formData.append('perfumers', JSON.stringify(perfumerIds.map(p => ({ perfumerId: p.value }))));

    const validMainAccords = mainAccords.filter(accord =>
      accord.name && accord.name.trim() !== '' && accord.width !== '0%'
    );
    formData.append('mainAccords', JSON.stringify(validMainAccords.map(accord => ({
      name: accord.name,
      width: accord.width ? `${accord.width}%` : '0%',
      backgroundColor: hexToRgb(accord.backgroundColor)
    }))));

    formData.append('notes', JSON.stringify({
      top: fragranceTop.map(note => ({ noteId: note.value })),
      middle: fragranceMiddle.map(note => ({ noteId: note.value })),
      base: fragranceBottom.map(note => ({ noteId: note.value })),
      note: fragranceNotes.map(note => ({ noteId: note.value }))
    }));

    // formData.append('occasions', JSON.stringify([
    //   { name: "day", width: form.occasionDay },
    //   { name: "night", width: form.occasionEvening }
    // ]));
    // formData.append('occasionVotes', JSON.stringify({
    //   day: form.occasionDay,
    //   night: form.occasionEvening
    // }));

    // formData.append('seasons', JSON.stringify([
    //   { name: "winter", width: form.seasonWinter },
    //   { name: "summer", width: form.seasonSummer },
    //   { name: "fall", width: form.seasonAutumn },
    //   { name: "spring", width: form.seasonSpring }
    // ]));

    try {
      setUpdating(true);
      await updatePerfume({ id: params.id, formData }).unwrap();
      toast.success("Perfume updated successfully!");
      navigate(`/perfumes/${params.id}`);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update perfume: " + (err?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  }, [form, imageFiles, images, perfumerIds, fragranceTop, fragranceMiddle, fragranceBottom, fragranceNotes, mainAccords, params.id, updatePerfume, navigate, validateForm]);

  // Custom styles for react-select with error states
  const getCustomStyles = (hasError) => ({
    control: (provided, state) => ({
      ...provided,
      border: `2px solid ${hasError ? '#ef4444' : state.isFocused ? '#352AA4' : '#eeeeee'}`,
      borderRadius: '16px',
      minHeight: '48px',
      fontSize: '15px',
      padding: '4px 8px',
      backgroundColor: '#fff',
      boxShadow: state.isFocused
        ? hasError
          ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
          : '0 0 0 3px rgba(53, 42, 164, 0.1)'
        : 'none',
      '&:hover': {
        borderColor: hasError ? '#ef4444' : '#352AA4',
      },
      transition: 'all 0.2s ease'
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#E1F8F8',
      borderRadius: '8px',
      padding: '2px 4px',
      border: '1px solid #67E9E9',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#0891b2',
      fontWeight: '500',
      fontSize: '14px',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#0891b2',
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#0891b2',
        color: 'white',
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      border: '1px solid #E1F8F8',
      overflow: 'hidden',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#352AA4'
        : state.isFocused
          ? '#E1F8F8'
          : 'white',
      color: state.isSelected ? 'white' : '#333',
      padding: '10px 16px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s ease',
    }),
  });

  // Early return AFTER all hooks have been called
  if (isLoading) {
    return <Loader message="Getting perfume data" />;
  }
  if (notesLoading || perfumersLoading) {
    return <Loader message="Loading perfume data" />;
  }
  if (updateLoading) {
    return <Loader message="Updating perfume" />
  }
  if (error) {
    return <div className="text-red-500 text-center">Error loading perfume data</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-6">
        <div className="flex justify-between items-center py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
            <h1 className="text-[24px] font-bold text-[#352AA4]">Edit Perfume</h1>
          </div>
          <div className="flex gap-[16px]">
            <button
              type="button"
              className="bg-white text-[#352AA4] text-sm border-2 border-[#352AA4]/20 rounded-full px-6 py-2.5 transition-all duration-300 hover:bg-gray-50 hover:border-[#352AA4] hover:shadow-md font-medium flex items-center gap-2"
              onClick={() => navigate(-1)}
            >
              <span className="text-lg">←</span>
              Back
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-[#352AA4] text-white text-sm border-2 border-[#352AA4] rounded-full px-6 py-2.5 transition-all duration-300 hover:bg-[#2a2183] hover:shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={updating}
            >
              {updating ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <span className="text-lg">✓</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-gradient-to-br from-[#E1F8F8] to-[#D4E8F8] rounded-[30px] shadow-lg overflow-hidden">
        <div className="bg-white/60 backdrop-blur-sm rounded-[30px] p-[32px] max-lg:p-[20px] m-[2px]">
          <form onSubmit={handleSubmit} className="space-y-[32px]">

            {/* Basic Information Section */}
            <div className="bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
              <div className="flex items-center gap-2 mb-[24px]">
                <div className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                <h3 className="text-[20px] font-bold text-[#352AA4]">Basic Information</h3>
              </div>

              <div className="space-y-[20px]">
                {/* Multiple Image Uploader */}
                <div>
                  <MultipleImageUploader
                    onImagesChange={handleImagesChange}
                    currentImages={images}
                    error={imageError || formErrors.images}
                    required={true}
                    maxImages={10}
                    maxSizeInMB={5}
                  />
                  {(imageError || formErrors.images) && (
                    <span className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                      <span>⚠</span> {imageError || formErrors.images}
                    </span>
                  )}
                </div>

                {/* Name and Brand */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  <div>
                    <FormField
                      label="Perfume Name"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Enter perfume name"
                      error={touched.name && formErrors.name}
                      required
                    />
                    {formErrors.name && (
                      <span className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                        <span>⚠</span> {formErrors.name}
                      </span>
                    )}
                  </div>

                  <FormField
                    label="Perfume Brand Name"
                    name="brand"
                    value={form.brand}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter brand name"
                    error={touched.brand && formErrors.brand}
                    required
                  />
                </div>

                {/* Intended For and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  <div className="w-full">
                    <IntendedForMultiSelect
                      value={form.intendedFor}
                      onChange={handleIntendedForChange}
                    />
                    {formErrors.intendedFor && (
                      <span className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                        <span>⚠</span> {formErrors.intendedFor}
                      </span>
                    )}
                  </div>
                  <div className="w-full">
                    <FormField
                      label="Description"
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Enter perfume description"
                      textArea
                      rows="6"
                      error={touched.description && formErrors.description}
                    />
                  </div>
                </div>

                {/* Concentration and Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  <FormField
                    label="Concentration"
                    name="concentration"
                    value={form.concentration}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="e.g., Eau de Parfum"
                    error={touched.concentration && formErrors.concentration}
                  />
                  <FormField
                    label="Year Release"
                    name="yearRelease"
                    type="number"
                    value={form.yearRelease}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    min="1900"
                    max={new Date().getFullYear()}
                    placeholder="Enter release year"
                    error={touched.yearRelease && formErrors.yearRelease}
                  />
                </div>
              </div>
            </div>

            {/* Occasion Section */}
            {/* <div className="bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
              <div className="flex items-center gap-2 mb-[20px]">
                <div className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                <h3 className="text-[20px] font-bold text-[#352AA4]">Occasion Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                <FormField
                  label="Day Time (%)"
                  name="occasionDay"
                  type="number"
                  value={form.occasionDay}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="0-100"
                  error={touched.occasionDay && formErrors.occasionDay}
                />
                <FormField
                  label="Evening (%)"
                  name="occasionEvening"
                  type="number"
                  value={form.occasionEvening}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="0-100"
                  error={touched.occasionEvening && formErrors.occasionEvening}
                />
              </div>
              {formErrors.occasions && (
                <span className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                  <span>⚠</span> {formErrors.occasions}
                </span>
              )}
            </div> */}

            {/* Season Section */}
            {/* <div className="bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
              <div className="flex items-center gap-2 mb-[20px]">
                <div className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                <h3 className="text-[20px] font-bold text-[#352AA4]">Season Settings</h3>
              </div>

              <SeasonFields
                form={form}
                onInputChange={handleInputChange}
                onBlur={handleBlur}
                formErrors={formErrors}
                touched={touched}
              />
              {formErrors.seasons && (
                <span className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                  <span>⚠</span> {formErrors.seasons}
                </span>
              )}
            </div> */}

            {/* Perfumer Section */}
            <div className="bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
              <div className="flex items-center gap-2 mb-[20px]">
                <div className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                <h3 className="text-[20px] font-bold text-[#352AA4]">Perfumer</h3>
              </div>

              <div className="flex flex-col">
                <label className="text-[#7C7C7C] text-[14px] font-medium mb-2">Select Perfumer(s)</label>
                <Select
                  isMulti
                  options={perfumerOptions}
                  value={perfumerIds}
                  onChange={onPerfumerChange}
                  placeholder="Search and select perfumers..."
                  styles={getCustomStyles(formErrors.perfumers)}
                  closeMenuOnSelect={false}
                  filterOption={customFilterOption}
                />
                {formErrors.perfumers && (
                  <span className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                    <span>⚠</span> {formErrors.perfumers}
                  </span>
                )}
              </div>
            </div>

            {/* Fragrance Notes Section */}
            <div className="bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
              <div className="flex items-center gap-2 mb-[20px]">
                <div className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                <h3 className="text-[20px] font-bold text-[#352AA4]">Fragrance Notes</h3>
              </div>

              <div className="space-y-[16px]">
                {/* Top and Middle Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  <div className="flex flex-col">
                    <label className="text-[#7C7C7C] text-[14px] font-medium mb-2">Top Notes</label>
                    <Select
                      isMulti
                      options={noteOptions}
                      value={fragranceTop}
                      onChange={onTopNotesChange}
                      placeholder="Select top notes..."
                      styles={getCustomStyles(formErrors.notes)}
                      closeMenuOnSelect={false}
                      filterOption={customFilterOption}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[#7C7C7C] text-[14px] font-medium mb-2">Middle Notes</label>
                    <Select
                      isMulti
                      options={noteOptions}
                      value={fragranceMiddle}
                      onChange={onMiddleNotesChange}
                      placeholder="Select middle notes..."
                      styles={getCustomStyles(formErrors.notes)}
                      closeMenuOnSelect={false}
                      filterOption={customFilterOption}
                    />
                  </div>
                </div>

                {/* Base and Other Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  <div className="flex flex-col">
                    <label className="text-[#7C7C7C] text-[14px] font-medium mb-2">Base Notes</label>
                    <Select
                      isMulti
                      options={noteOptions}
                      value={fragranceBottom}
                      onChange={onBottomNotesChange}
                      placeholder="Select base notes..."
                      styles={getCustomStyles(formErrors.notes)}
                      closeMenuOnSelect={false}
                      filterOption={customFilterOption}
                    />
                  </div>
                  {fragranceNotes.length > 0 && (
                    <div className="flex flex-col">
                      <label className="text-[#7C7C7C] text-[14px] font-medium mb-2">Other Notes</label>
                      <Select
                        isMulti
                        options={noteOptions}
                        value={fragranceNotes}
                        onChange={onNoteNotesChange}
                        placeholder="Select other notes..."
                        styles={getCustomStyles(formErrors.notes)}
                        closeMenuOnSelect={false}
                        filterOption={customFilterOption}
                      />
                    </div>
                  )}
                </div>

                {formErrors.notes && (
                  <span className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                    <span>⚠</span> {formErrors.notes}
                  </span>
                )}
              </div>
            </div>

            {/* Main Accords Section */}
            <div className="bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
              <div className="flex items-center gap-2 mb-[20px]">
                <div className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                <h3 className="text-[20px] font-bold text-[#352AA4]">Main Accords</h3>
              </div>

              <AccordsList
                accords={mainAccords}
                onUpdate={handleAccordUpdate}
                onAdd={handleAddAccord}
                onRemove={handleRemoveAccord}
              />
              {formErrors.accords && (
                <span className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                  <span>⚠</span> {formErrors.accords}
                </span>
              )}
            </div>

          </form>
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-8"></div>
    </div>
  );
};

export default EditPerfume;
