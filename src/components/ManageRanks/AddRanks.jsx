import React, { useState, useEffect } from 'react'
import cross_icon from '../../assets/icons/cross-icon.svg'
import addpic_icon from '../../assets/icons/addpic-icon.svg'
import { toast } from 'react-toastify' // Add this import

// Custom validation hook
const useValidation = () => {
  const [errors, setErrors] = useState({})

  const validateField = (name, value, allValues = {}) => {
    let error = ''

    switch (name) {
      case 'name':
        if (!value || !value.trim()) {
          error = 'Rank name is required'
        } else if (value.trim().length < 2) {
          error = 'Rank name must be at least 2 characters'
        } else if (value.trim().length > 50) {
          error = 'Rank name cannot exceed 50 characters'
        }
        break

      case 'description':
        if (value && value.length > 50000) {
          error = 'Description cannot exceed 50000 characters'
        }
        break

      case 'min':
        if (!value && value !== 0) {
          error = 'Min value is required'
        } else if (isNaN(value) || value < 0) {
          error = 'Min value must be a positive number'
        } else if (!Number.isInteger(Number(value))) {
          error = 'Min value must be a whole number'
        } else if (allValues.max && Number(value) >= Number(allValues.max)) {
          error = 'Min value must be less than max value'
        }
        break

      case 'max':
        if (!value && value !== 0) {
          error = 'Max value is required'
        } else if (isNaN(value) || value < 0) {
          error = 'Max value must be a positive number'
        } else if (!Number.isInteger(Number(value))) {
          error = 'Max value must be a whole number'
        } else if (allValues.min && Number(value) <= Number(allValues.min)) {
          error = 'Max value must be greater than min value'
        }
        break

      case 'image':
      case 'otherImage':
      case 'imageWithoutLabel':
        if (value) {
          const validationResult = validateFile(value)
          if (!validationResult.isValid) {
            error = validationResult.error
          }
        }
        break

      default:
        break
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }))

    return error === ''
  }

  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

    if (!file) {
      return { isValid: true, error: '' }
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${maxSize / (1024 * 1024)}MB`
      }
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Only JPEG, PNG, GIF, and WebP images are allowed'
      }
    }

    return { isValid: true, error: '' }
  }

  const validateForm = (formData) => {
    const newErrors = {}
    let isValid = true

    // Validate name
    if (!validateField('name', formData.name)) {
      isValid = false
    }

    // Validate description
    if (!validateField('description', formData.description)) {
      isValid = false
    }

    // Validate min
    if (!validateField('min', formData.min, { max: formData.max })) {
      isValid = false
    }

    // Validate max
    if (!validateField('max', formData.max, { min: formData.min })) {
      isValid = false
    }

    // Validate files
    if (formData.image && !validateField('image', formData.image)) {
      isValid = false
    }

    if (formData.otherImage && !validateField('otherImage', formData.otherImage)) {
      isValid = false
    }

    if (formData.imageWithoutLabel && !validateField('imageWithoutLabel', formData.imageWithoutLabel)) {
      isValid = false
    }

    return isValid
  }

  const clearErrors = () => {
    setErrors({})
  }

  const clearError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearError
  }
}

const AddRanks = ({ open, onClose, onSubmit, initialData = null }) => {
  // State for all form fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [otherImage, setOtherImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [otherPreview, setOtherPreview] = useState(null)
  const [imageWithoutLabel, setImageWithoutLabel] = useState(null)
  const [otherImageWithoutLabel, setOtherImageWithoutLabel] = useState(null)
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation hook
  const { errors, validateField, validateForm, clearErrors, clearError } = useValidation()

  // Handle initialData (on edit)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setDescription(initialData.description || '')
      setMin(initialData.min?.toString() || '')
      setMax(initialData.max?.toString() || '')

      // Handle existing images
      if (initialData.image) {
        const imageUrl = initialData.image.startsWith('http')
          ? initialData.image
          : `${import.meta.env.VITE_BASE_URL}${initialData.image}`;
        setPreview(imageUrl);
      }

      if (initialData.otherImage) {
        const otherImageUrl = initialData.otherImage.startsWith('http')
          ? initialData.otherImage
          : `${import.meta.env.VITE_BASE_URL}${initialData.otherImage}`;
        setOtherPreview(otherImageUrl);
      }

      if (initialData.imageWithoutLabel) {
        const imageUrl = initialData.imageWithoutLabel.startsWith('http')
          ? initialData.imageWithoutLabel
          : `${import.meta.env.VITE_BASE_URL}${initialData.imageWithoutLabel}`;
        setOtherImageWithoutLabel(imageUrl);
      }
    } else {
      // Reset all fields
      setName('')
      setDescription('')
      setImage(null)
      setOtherImage(null)
      setPreview(null)
      setOtherPreview(null)
      setImageWithoutLabel(null)
      setOtherImageWithoutLabel(null)
      setMin('')
      setMax('')
    }

    // Clear validation errors when modal opens/closes
    clearErrors()
  }, [initialData, open])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
      if (otherPreview && otherPreview.startsWith('blob:')) {
        URL.revokeObjectURL(otherPreview);
      }
      if (otherImageWithoutLabel && otherImageWithoutLabel.startsWith('blob:')) {
        URL.revokeObjectURL(otherImageWithoutLabel);
      }
    };
  }, [preview, otherPreview, otherImageWithoutLabel])

  // Enhanced image handlers with validation
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (validateField('image', file)) {
        setImage(file)
        setPreview(URL.createObjectURL(file))
        clearError('image')
      } else {
        e.target.value = '' // Clear the input
      }
    }
  }

  const handleOtherImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (validateField('otherImage', file)) {
        setOtherImage(file)
        setOtherPreview(URL.createObjectURL(file))
        clearError('otherImage')
      } else {
        e.target.value = '' // Clear the input
      }
    }
  }

  const handleImageWithoutLabelChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (validateField('imageWithoutLabel', file)) {
        setImageWithoutLabel(file)
        setOtherImageWithoutLabel(URL.createObjectURL(file))
        clearError('imageWithoutLabel')
      } else {
        e.target.value = '' // Clear the input
      }
    }
  }

  // Enhanced input handlers with real-time validation
  const handleNameChange = (e) => {
    const value = e.target.value
    setName(value)
    validateField('name', value)
  }

  const handleDescriptionChange = (e) => {
    const value = e.target.value
    setDescription(value)
    validateField('description', value)
  }

  const handleMinChange = (e) => {
    const value = e.target.value
    setMin(value)
    validateField('min', value, { max })
    // Re-validate max when min changes
    if (max) {
      validateField('max', max, { min: value })
    }
  }

  const handleMaxChange = (e) => {
    const value = e.target.value
    setMax(value)
    validateField('max', value, { min })
    // Re-validate min when max changes
    if (min) {
      validateField('min', min, { max: value })
    }
  }

  // Enhanced form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = {
        name,
        description,
        min,
        max,
        image,
        otherImage,
        imageWithoutLabel
      }

      // Validate entire form
      if (!validateForm(formData)) {
        // toast.error('Please correct the errors before submitting')
        return
      }

      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('name', name.trim())
      submitData.append('description', description.trim())
      submitData.append('min', parseInt(min))
      submitData.append('max', parseInt(max))

      if (image instanceof File) {
        submitData.append('image', image)
      }
      if (otherImage instanceof File) {
        submitData.append('otherImage', otherImage)
      }
      if (imageWithoutLabel instanceof File) {
        submitData.append('imageWithoutLabel', imageWithoutLabel)
      }

      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('An error occurred while saving the rank')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper component for error display
  const ErrorMessage = ({ error }) => {
    if (!error) return null
    return (
      <span className="text-red-500 text-xs mt-1 block">{error}</span>
    )
  }

  // Auto-close modal if not open
  if (!open) return null

  const hasErrors = Object.keys(errors).some(key => errors[key])
  const isFormValid = name.trim() && min && max &&
    parseInt(min) < parseInt(max) &&
    !hasErrors

  return (
    <div className='w-full min-h-screen fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center p-4'>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[24px] max-w-[600px] w-full max-h-[90vh] overflow-y-auto p-8 max-md:p-4 max-md:max-h-[95vh]"
        autoComplete="off"
        noValidate
      >
        <div className="flex items-center justify-between mb-6">
          <h5 className='text-[20px] text-[#352AA4] font-semibold'>
            {initialData ? 'Edit Rank' : 'Add Rank'}
          </h5>
          <button
            type="button"
            className='cursor-pointer'
            onClick={onClose}
            aria-label="Close"
            disabled={isSubmitting}
          >
            <img src={cross_icon} alt="Close" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Image Upload Sections */}
          <div className="flex gap-3 max-md:flex-col">
            <div className="flex-1">
              <label className={`flex justify-center items-center border rounded-2xl p-4 h-[210px] cursor-pointer ${errors.image ? 'border-red-300' : 'border-[#EFEFEF]'
                }`}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
                <div className="flex flex-col justify-center items-center">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-[150px] mb-[10px] rounded-xl object-contain"
                    />
                  ) : (
                    <img src={addpic_icon} alt="" />
                  )}
                  <p className='text-[#666666] text-center text-sm'>
                    {preview ? 'Change Image' : 'Add Main Image'}
                  </p>
                </div>
              </label>
              <ErrorMessage error={errors.image} />
            </div>

            <div className="flex-1">
              <label className={`flex justify-center items-center border rounded-2xl p-4 h-[210px] cursor-pointer ${errors.otherImage ? 'border-red-300' : 'border-[#EFEFEF]'
                }`}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleOtherImageChange}
                  disabled={isSubmitting}
                />
                <div className="flex flex-col justify-center items-center">
                  {otherPreview ? (
                    <img
                      src={otherPreview}
                      alt="Other Preview"
                      className="max-h-[150px] mb-[10px] rounded-xl object-contain"
                    />
                  ) : (
                    <img src={addpic_icon} alt="" />
                  )}
                  <p className='text-[#666666] text-center text-sm'>
                    {otherPreview ? 'Change Alt Image' : 'Add Alternative Image'}
                  </p>
                </div>
              </label>
              <ErrorMessage error={errors.otherImage} />
            </div>

            <div className="flex-1">
              <label className={`flex justify-center items-center border rounded-2xl p-4 h-[210px] cursor-pointer ${errors.imageWithoutLabel ? 'border-red-300' : 'border-[#EFEFEF]'
                }`}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageWithoutLabelChange}
                  disabled={isSubmitting}
                />
                <div className="flex flex-col justify-center items-center">
                  {otherImageWithoutLabel ? (
                    <img
                      src={otherImageWithoutLabel}
                      alt="Image Without Label"
                      className="max-h-[150px] mb-[10px] rounded-xl object-contain"
                    />
                  ) : (
                    <img src={addpic_icon} alt="" />
                  )}
                  <p className='text-[#666666] text-center text-sm'>
                    {otherImageWithoutLabel ? 'Change Image Without Label' : 'Add Image Without Label'}
                  </p>
                </div>
              </label>
              <ErrorMessage error={errors.imageWithoutLabel} />
            </div>
          </div>

          {/* Form Fields */}
          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Rank Name *</span>
            <input
              className={`border rounded-2xl py-[14px] px-[18px] ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-[#EEEEEE] focus:border-[#352AA4]'
                } focus:outline-none transition-colors`}
              type="text"
              placeholder='Enter rank name'
              value={name}
              onChange={handleNameChange}
              disabled={isSubmitting}
              maxLength={50}
            />
            <ErrorMessage error={errors.name} />
          </label>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>
              Description
              <span className="text-xs text-gray-400 ml-1">
                ({description.length}/50000)
              </span>
            </span>
            <textarea
              className={`border rounded-2xl py-[14px] px-[18px] min-h-[100px] resize-none ${errors.description ? 'border-red-300 focus:border-red-500' : 'border-[#EEEEEE] focus:border-[#352AA4]'
                } focus:outline-none transition-colors`}
              placeholder='Enter rank description'
              value={description}
              onChange={handleDescriptionChange}
              disabled={isSubmitting}
              maxLength={50000}
            />
            <ErrorMessage error={errors.description} />
          </label>

          {/* Min/Max Values */}
          <div className="grid grid-cols-2 gap-4">
            <label className='flex flex-col w-full'>
              <span className='text-[#7C7C7C] text-[14px] mb-1'>Min Value *</span>
              <input
                className={`border rounded-2xl py-[14px] px-[18px] ${errors.min ? 'border-red-300 focus:border-red-500' : 'border-[#EEEEEE] focus:border-[#352AA4]'
                  } focus:outline-none transition-colors`}
                type="number"
                placeholder='0'
                value={min}
                onChange={handleMinChange}
                disabled={isSubmitting}
                min="0"
                step="1"
              />
              <ErrorMessage error={errors.min} />
            </label>

            <label className='flex flex-col w-full'>
              <span className='text-[#7C7C7C] text-[14px] mb-1'>Max Value *</span>
              <input
                className={`border rounded-2xl py-[14px] px-[18px] ${errors.max ? 'border-red-300 focus:border-red-500' : 'border-[#EEEEEE] focus:border-[#352AA4]'
                  } focus:outline-none transition-colors`}
                type="number"
                placeholder='100'
                value={max}
                onChange={handleMaxChange}
                disabled={isSubmitting}
                min="1"
                step="1"
              />
              <ErrorMessage error={errors.max} />
            </label>
          </div>

          {/* Range Preview */}
          {min && max && parseInt(min) < parseInt(max) && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 font-medium">Range Preview:</span>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 px-3 py-1 rounded-lg">
                    <span className="text-blue-800 font-semibold text-sm">Min: {min}</span>
                  </div>
                  <div className="text-blue-400">—</div>
                  <div className="bg-green-100 px-3 py-1 rounded-lg">
                    <span className="text-green-800 font-semibold text-sm">Max: {max}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Users with scores between {min} and {max} will receive this rank
              </p>
            </div>
          )}

          {/* Validation Warning */}
          {min && max && parseInt(min) >= parseInt(max) && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-700 font-medium">Invalid Range</span>
              </div>
              <p className="text-xs text-red-600 mt-1">
                Min value must be less than max value
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-[16px] mt-[24px] flex-wrap">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-500 bg-white border-2 rounded-full border-gray-500 hover:bg-gray-500 hover:text-white font-semibold py-2 px-4 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            className={`font-semibold py-2 px-6 rounded-full transition-colors duration-300 flex items-center gap-2 ${isFormValid && !isSubmitting
                ? 'bg-[#352AA4] hover:bg-[#2a1f7a] text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            type="submit"
          // disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSubmitting
              ? 'Saving...'
              : initialData
                ? 'Update Rank'
                : 'Create Rank'
            }
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddRanks
