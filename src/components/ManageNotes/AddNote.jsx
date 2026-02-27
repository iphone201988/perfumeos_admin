import React, { useState, useEffect } from 'react'
import cross_icon from '../../assets/icons/cross-icon.svg'
import addpic_icon from '../../assets/icons/addpic-icon.svg'
import { toast } from 'react-toastify'

const AddNote = ({ open, onClose, onSubmit, initialData = null }) => {
  // State for all form fields
  const [name, setName] = useState('')
  const [odorProfile, setOdorProfile] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [group, setGroup] = useState('')
  const [scentCategory, setScentCategory] = useState('')
  const [scientificName, setScientificName] = useState('')
  const [otherNames, setOtherNames] = useState([''])

  // Validation states
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Validation rules
  const validateField = (fieldName, value) => {
    let error = ''

    switch (fieldName) {
      case 'name':
        if (!value || value.trim() === '') {
          error = 'Note name is required'
        } else if (value.trim().length < 2) {
          error = 'Note name must be at least 2 characters'
        } else if (value.trim().length > 100) {
          error = 'Note name must be less than 100 characters'
        }
        break

      case 'odorProfile':
        if (!value || value.trim() === '') {
        } else if (value.trim().length < 10) {
          error = 'Odor profile must be at least 10 characters'
        } else if (value.trim().length > 500) {
          error = 'Odor profile must be less than 500 characters'
        }
        break

      case 'group':
        if (!value || value.trim() === '') {
        } else if (value.trim().length < 2) {
          error = 'Group must be at least 2 characters'
        } else if (value.trim().length > 50) {
          error = 'Group must be less than 50 characters'
        }
        break

      case 'scientificName':
        if (!value || value.trim() === '') {
        } else if (value.trim().length < 2) {
          error = 'Scientific name must be at least 2 characters'
        } else if (value.trim().length > 100) {
          error = 'Scientific name must be less than 100 characters'
        }
        break

      case 'otherNames':
        // Validate other names array
        const validNames = value.filter(n => n && n.trim() !== '')
        const duplicateNames = validNames.filter((name, index) =>
          validNames.indexOf(name) !== index
        )

        if (duplicateNames.length > 0) {
          // error = 'Other names must be unique'
        }

        // Check individual name lengths
        const longNames = validNames.filter(name => name.trim().length > 50)
        if (longNames.length > 0) {
          error = 'Each name must be less than 50 characters'
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
    newErrors.odorProfile = validateField('odorProfile', odorProfile)
    newErrors.group = validateField('group', group)
    newErrors.scientificName = validateField('scientificName', scientificName)
    newErrors.otherNames = validateField('otherNames', otherNames)

    // Image validation (only required for new notes)
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
      case 'odorProfile':
        setOdorProfile(value)
        break
      case 'group':
        setGroup(value)
        break
      case 'scientificName':
        setScientificName(value)
        break
      case 'scentCategory':
        setScentCategory(value)
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
      case 'odorProfile':
        value = odorProfile
        break
      case 'group':
        value = group
        break
      case 'scientificName':
        value = scientificName
        break
      case 'scentCategory':
        value = scentCategory
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
      setOdorProfile(initialData.odorProfile || '')
      setGroup(initialData.group || '')
      setScentCategory(initialData.scentCategory || '')
      setScientificName(initialData.scientificName || '')
      setOtherNames(initialData.otherNames && initialData.otherNames.length > 0 ? initialData.otherNames : [''])

      // if (initialData.image) {
      //   const imageUrl = initialData.image.startsWith('http')
      //     ? initialData.image
      //     : `${import.meta.env.VITE_BASE_URL}${initialData.image}`;
      //   setPreview(imageUrl);
      // }
    } else {
      // Reset all fields
      setName('')
      setImage(null)
      setPreview(null)
      setOdorProfile('')
      setGroup('')
      setScentCategory('')
      setScientificName('')
      setOtherNames([''])
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

  // Other Names handlers with validation
  const handleOtherNameChange = (index, value) => {
    const updatedNames = [...otherNames]
    updatedNames[index] = value
    setOtherNames(updatedNames)

    // Validate other names
    const error = validateField('otherNames', updatedNames)
    setErrors(prev => ({
      ...prev,
      otherNames: error
    }))
    setTouched(prev => ({ ...prev, otherNames: true }))
  }

  const addOtherNameField = () => {
    setOtherNames([...otherNames, ''])
  }

  const removeOtherNameField = (index) => {
    if (otherNames.length > 1) {
      const updatedNames = otherNames.filter((_, i) => i !== index)
      setOtherNames(updatedNames)

      // Re-validate other names
      const error = validateField('otherNames', updatedNames)
      setErrors(prev => ({
        ...prev,
        otherNames: error
      }))
    }
  }

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
        return
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          image: 'Image size must be less than 5MB'
        }))
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
      odorProfile: true,
      group: true,
      scientificName: true,
      otherNames: true,
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
    formData.append('odorProfile', odorProfile.trim())
    formData.append('group', group.trim())
    formData.append('scentCategory', scentCategory.trim())
    formData.append('scientificName', scientificName.trim())

    // Add otherNames array - filter out empty values
    const validOtherNames = otherNames.filter(name => name.trim() !== '')
    if (validOtherNames.length > 0) {
      formData.append('otherNames', JSON.stringify(validOtherNames))
    }

    if (image instanceof File) {
      formData.append('image', image)
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
            {initialData ? 'Edit Note' : 'Add Note'}
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
                Note Image {!initialData && <span className="text-red-500"></span>}
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
              Note Name <span className="text-red-500">*</span>
            </span>
            <input
              className={`
                border rounded-2xl py-[14px] px-[18px]
                ${errors.name && touched.name ? 'border-red-500' : 'border-[#EEEEEE]'}
              `}
              type="text"
              placeholder='Enter Note name'
              value={name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
            />
            {errors.name && touched.name && (
              <span className="text-red-500 text-xs mt-1">{errors.name}</span>
            )}
          </label>

          {/* Other Names Dynamic Fields */}
          <div className='flex flex-col w-full'>
            <div className="flex items-center justify-between mb-2">
              <span className='text-[#7C7C7C] text-[14px]'>Other Names</span>
              <button
                type="button"
                onClick={addOtherNameField}
                className="text-[#352AA4] hover:text-[#2a1f7a] text-sm font-medium transition-colors duration-300"
              >
                + Add Name
              </button>
            </div>

            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              {otherNames.map((otherName, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    className={`
                      border rounded-2xl py-[12px] px-[16px] flex-1 text-sm
                      ${errors.otherNames && touched.otherNames ? 'border-red-500' : 'border-[#EEEEEE]'}
                    `}
                    type="text"
                    placeholder={`Enter name ${index + 1}`}
                    value={otherName}
                    onChange={(e) => handleOtherNameChange(index, e.target.value)}
                  />
                  {otherNames.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOtherNameField(index)}
                      className="text-red-500 hover:text-red-700 font-bold text-lg px-1 transition-colors duration-300 flex-shrink-0"
                      aria-label="Remove field"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.otherNames && touched.otherNames && (
              <span className="text-red-500 text-xs mt-1">{errors.otherNames}</span>
            )}
          </div>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>
              Scientific Name <span className="text-red-500"></span>
            </span>
            <input
              className={`
                border rounded-2xl py-[14px] px-[18px]
                ${errors.scientificName && touched.scientificName ? 'border-red-500' : 'border-[#EEEEEE]'}
              `}
              type="text"
              placeholder='Enter Scientific name'
              value={scientificName}
              onChange={(e) => handleFieldChange('scientificName', e.target.value)}
              onBlur={() => handleBlur('scientificName')}
            />
            {errors.scientificName && touched.scientificName && (
              <span className="text-red-500 text-xs mt-1">{errors.scientificName}</span>
            )}
          </label>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>
              Group <span className="text-red-500"></span>
            </span>
            <input
              className={`
                border rounded-2xl py-[14px] px-[18px]
                ${errors.group && touched.group ? 'border-red-500' : 'border-[#EEEEEE]'}
              `}
              type="text"
              placeholder='Enter Group name'
              value={group}
              onChange={(e) => handleFieldChange('group', e.target.value)}
              onBlur={() => handleBlur('group')}
            />
            {errors.group && touched.group && (
              <span className="text-red-500 text-xs mt-1">{errors.group}</span>
            )}
          </label>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>
              Scent Category
            </span>
            {/* <input
              className={`
                border rounded-2xl py-[14px] px-[18px]
                ${errors.scentCategory && touched.scentCategory ? 'border-red-500' : 'border-[#EEEEEE]'}
              `}
              type="text"
              placeholder='Enter Scent Category name'
              value={scentCategory}
              onChange={(e) => handleFieldChange('scentCategory', e.target.value)}
              onBlur={() => handleBlur('scentCategory')}
            />
            {errors.scentCategory && touched.scentCategory && (
              <span className="text-red-500 text-xs mt-1">{errors.scentCategory}</span>
            )} */}
            <select
              className={`
                border rounded-2xl py-[14px] px-[18px]
                ${errors.scentCategory && touched.scentCategory ? 'border-red-500' : 'border-[#EEEEEE]'}
              `}
              value={scentCategory}
              onChange={(e) => handleFieldChange('scentCategory', e.target.value)}
              onBlur={() => handleBlur('scentCategory')}
            >
              <option value="">Select Scent Category</option>
              <option value="Fresh Citrus">Fresh Citrus</option>
              <option value="Aromatic/Herbal">Aromatic/Herbal</option>
              <option value="Floral">Floral</option>
              <option value="Woody">Woody</option>
              <option value="Amber/Oriental">Amber/Oriental</option>
            </select>
          </label>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>
              Odor Profile <span className="text-red-500"></span>
            </span>
            <textarea
              className={`
                border rounded-2xl py-[14px] px-[18px] min-h-[100px] resize-none
                ${errors.odorProfile && touched.odorProfile ? 'border-red-500' : 'border-[#EEEEEE]'}
              `}
              placeholder='Enter Odor Profile (minimum 10 characters)'
              value={odorProfile}
              onChange={(e) => handleFieldChange('odorProfile', e.target.value)}
              onBlur={() => handleBlur('odorProfile')}
            />
            {errors.odorProfile && touched.odorProfile && (
              <span className="text-red-500 text-xs mt-1">{errors.odorProfile}</span>
            )}
            <span className="text-gray-500 text-xs mt-1">
              {odorProfile.length}/500 characters
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
            {initialData ? 'Update Note' : 'Create Note'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddNote
