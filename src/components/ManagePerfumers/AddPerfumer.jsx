import React, { useState, useEffect } from 'react'
import cross_icon from '../../assets/icons/cross-icon.svg'
import addpic_icon from '../../assets/icons/addpic-icon.svg'
import { toast } from 'react-toastify'

const AddPerfumer = ({ open, onClose, onSubmit, initialData = null }) => {
  // State for all form fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  // Validation states
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Validation rules
  const validateField = (fieldName, value) => {
    let error = ''
    
    switch (fieldName) {
      case 'name':
        if (!value || value.trim() === '') {
          error = 'Perfumer name is required'
        } else if (value.trim().length < 2) {
          error = 'Perfumer name must be at least 2 characters'
        } else if (value.trim().length > 100) {
          error = 'Perfumer name must be less than 100 characters'
        } else if (!/^[a-zA-Z\s\-'\.]+$/.test(value.trim())) {
          error = 'Perfumer name can only contain letters, spaces, hyphens, apostrophes, and dots'
        }
        break
      
      case 'description':
        if (!value || value.trim() === '') {
          error = 'Description is required'
        } else if (value.trim().length < 10) {
          error = 'Description must be at least 10 characters'
        } else if (value.trim().length > 1000) {
          error = 'Description must be less than 1000 characters'
        }
        break
      
      default:
        break
    }
    
    return error
  }

  // Validate entire form
  const validateForm = () => {
    const newErrors = {}
    
    // Validate basic fields
    newErrors.name = validateField('name', name)
    newErrors.description = validateField('description', description)
    
    // Image validation (only required for new perfumers)
    if (!initialData && !image) {
      newErrors.image = 'Please select an image'
    }
    
    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key]
    })
    
    return newErrors
  }

  // Handle field changes with validation
  const handleFieldChange = (fieldName, value) => {
    // Update the field value
    switch (fieldName) {
      case 'name':
        setName(value)
        break
      case 'description':
        setDescription(value)
        break
      default:
        break
    }
    
    // Mark as touched
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    
    // Validate and update errors
    const error = validateField(fieldName, value)
    setErrors(prev => ({ 
      ...prev, 
      [fieldName]: error 
    }))
  }

  // Handle blur events
  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    
    let value
    switch (fieldName) {
      case 'name':
        value = name
        break
      case 'description':
        value = description
        break
      default:
        return
    }
    
    const error = validateField(fieldName, value)
    setErrors(prev => ({ 
      ...prev, 
      [fieldName]: error 
    }))
  }

  // Handle initialData (on edit)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setDescription(initialData.description || '')

      // Handle existing images
      if (initialData.image) {
        const imageUrl = initialData.image.startsWith('http')
          ? initialData.image
          : `${import.meta.env.VITE_BASE_URL}${initialData.image}`;
        setPreview(imageUrl);
      }
    } else {
      // Reset all fields
      setName('')
      setImage(null)
      setPreview(null)
      setDescription('')
    }
    
    // Reset validation states
    setErrors({})
    setTouched({})
  }, [initialData, open])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup function to restore body scroll
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
    };
  }, [preview]);

  // Image Preview Handlers with validation
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ 
          ...prev, 
          image: 'Please select a valid image file (JPG, PNG, GIF, WebP)' 
        }))
        setTouched(prev => ({ ...prev, image: true }))
        return
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        setErrors(prev => ({ 
          ...prev, 
          image: 'Image size must be less than 5MB' 
        }))
        setTouched(prev => ({ ...prev, image: true }))
        return
      }
      
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setErrors(prev => ({ 
        ...prev, 
        image: '' 
      }))
      setTouched(prev => ({ ...prev, image: true }))
    }
  }

  // Form Submit Handler with validation
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate entire form
    const formErrors = validateForm()
    setErrors(formErrors)
    
    // Mark all fields as touched
    setTouched({
      name: true,
      description: true,
      image: true
    })

    // If there are errors, don't submit
    if (Object.keys(formErrors).length > 0) {
      // toast.error('Please fix all validation errors before submitting')
      return
    }

    // Create FormData for file upload
    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('description', description.trim())

    if (image instanceof File) {
      formData.append('bigImage', image)
    }

    onSubmit(formData)
    onClose()
  }

  // Auto-close modal if not open
  if (!open) return null

  return (
    <div className='w-full min-h-screen fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center p-4'>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[24px] max-w-[600px] w-full max-h-[90vh] overflow-y-auto p-8 max-md:p-4 max-md:max-h-[95vh]"
        autoComplete="off"
      >
        <div className="flex items-center justify-between mb-6">
          <h5 className='text-[20px] text-[#352AA4] font-semibold'>
            {initialData ? 'Edit Perfumer' : 'Add Perfumer'}
          </h5>
          <button
            type="button"
            className='cursor-pointer'
            onClick={onClose}
            aria-label="Close"
          >
            <img src={cross_icon} alt="Close" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Image Upload Section */}
          <div className="flex gap-3 max-md:flex-col">
            <div className="flex flex-col flex-1">
              <span className='text-[#7C7C7C] text-[14px] mb-2'>
                Perfumer Image {!initialData && <span className="text-red-500">*</span>}
              </span>
              <label className={`
                flex justify-center items-center border rounded-2xl p-4 h-[210px] cursor-pointer
                ${errors.image && touched.image ? 'border-red-500' : 'border-[#EFEFEF]'}
              `}>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
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
                  <p className="text-[#999999] text-center text-xs mt-1">
                    Max 5MB • JPG, PNG, GIF, WebP
                  </p>
                </div>
              </label>
              {errors.image && touched.image && (
                <span className="text-red-500 text-xs mt-1">{errors.image}</span>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>
              Perfumer Name <span className="text-red-500">*</span>
            </span>
            <input
              className={`
                border rounded-2xl py-[14px] px-[18px]
                ${errors.name && touched.name ? 'border-red-500' : 'border-[#EEEEEE]'}
              `}
              type="text"
              placeholder='Enter Perfumer name'
              value={name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
            />
            {errors.name && touched.name && (
              <span className="text-red-500 text-xs mt-1">{errors.name}</span>
            )}
            <span className="text-gray-500 text-xs mt-1">
              {name.length}/100 characters
            </span>
          </label>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>
              Description <span className="text-red-500">*</span>
            </span>
            <textarea
              className={`
                border rounded-2xl py-[14px] px-[18px] min-h-[120px] resize-none
                ${errors.description && touched.description ? 'border-red-500' : 'border-[#EEEEEE]'}
              `}
              placeholder='Enter perfumer description (minimum 10 characters)'
              value={description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
            />
            {errors.description && touched.description && (
              <span className="text-red-500 text-xs mt-1">{errors.description}</span>
            )}
            <span className="text-gray-500 text-xs mt-1">
              {description.length}/1000 characters
            </span>
          </label>
        </div>

        <div className="flex justify-center gap-[16px] mt-[24px] flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 bg-white border-2 rounded-full border-gray-500 hover:bg-gray-500 hover:text-white font-semibold py-2 px-4 transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            className='bg-[#352AA4] hover:bg-[#2a1f7a] text-white font-semibold py-2 px-6 rounded-full transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
            type="submit"
          >
            {initialData ? 'Update Perfumer' : 'Create Perfumer'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddPerfumer
