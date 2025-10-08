import React, { useState, useEffect } from 'react'
import cross_icon from '../../assets/icons/cross-icon.svg'
import addpic_icon from '../../assets/icons/addpic-icon.svg'
import { toast } from 'react-toastify'

const AddBadge = ({ open, onClose, onSubmit, initialData = null }) => {
  // State for all form fields
  const [name, setName] = useState('')
  const [image, setImage] = useState(null)
  const [otherImage, setOtherImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [blackWhitePreview, setBlackWhitePreview] = useState(null)
  const [category, setCategory] = useState('')
  const [isOneTimeOnly, setIsOneTimeOnly] = useState(false)
  const [isRepeatable, setIsRepeatable] = useState(false)
  const [repeatLimit, setRepeatLimit] = useState('1')
  const [repeatType, setRepeatType] = useState('')
  const [note, setNote] = useState('')
  const [unlockCondition, setUnlockCondition] = useState('')
  const [rarity, setRarity] = useState('')
  const [pointEarned, setPointEarned] = useState('')
  const [requiredCount, setRequiredCount] = useState('')

  // Validation states
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Validation rules
  const validateField = (fieldName, value) => {
    let error = ''
    
    switch (fieldName) {
      case 'name':
        if (!value || value.trim() === '') {
          error = 'Badge name is required'
        } else if (value.trim().length < 2) {
          error = 'Badge name must be at least 2 characters'
        } else if (value.trim().length > 100) {
          error = 'Badge name must be less than 100 characters'
        } else if (!/^[a-zA-Z0-9\s\-_\.]+$/.test(value.trim())) {
          error = 'Badge name can only contain letters, numbers, spaces, hyphens, underscores, and dots'
        }
        break
      
      case 'category':
        if (!value || value.trim() === '') {
          error = 'Category is required'
        }
        break
      
      case 'unlockCondition':
        if (!value || value.trim() === '') {
          error = 'Unlock condition is required'
        } else if (value.trim().length < 5) {
          error = 'Unlock condition must be at least 5 characters'
        } else if (value.trim().length > 200) {
          error = 'Unlock condition must be less than 200 characters'
        }
        break
      
      case 'rarity':
        if (!value ) {
          error = 'Rarity is required'
        }
        break
      
      case 'pointEarned':
        if (!value ) {
          error = 'Point earned is required'
        } else {
          const points = parseInt(value)
          if (isNaN(points) || points < 0) {
            error = 'Points must be a positive number'
          } else if (points > 10000) {
            error = 'Points cannot exceed 10,000'
          }
        }
        break
      
      case 'requiredCount':
        if (!value ) {
          error = 'Required count is required'
        } else {
          const count = parseInt(value)
          if (isNaN(count) || count < 1) {
            error = 'Required count must be at least 1'
          } else if (count > 1000) {
            error = 'Required count cannot exceed 1,000'
          }
        }
        break
      
      case 'repeatType':
        if (isRepeatable && (!value || value?.trim() === '')) {
          error = 'Repeat type is required when badge is repeatable'
        }
        break
      
      case 'repeatLimit':
        if (isRepeatable) {
          if (!value ) {
            error = 'Repeat limit is required when badge is repeatable'
          } else {
            const limit = parseInt(value)
            if (isNaN(limit) || limit < 1) {
              error = 'Repeat limit must be at least 1'
            } else if (limit > 100) {
              error = 'Repeat limit cannot exceed 100'
            }
          }
        }
        break
      
      case 'note':
        if (value && value.trim() && value.trim().length > 500) {
          error = 'Note must be less than 500 characters'
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
    
    // Validate all fields
    newErrors.name = validateField('name', name)
    newErrors.category = validateField('category', category)
    newErrors.unlockCondition = validateField('unlockCondition', unlockCondition)
    newErrors.rarity = validateField('rarity', rarity)
    newErrors.pointEarned = validateField('pointEarned', pointEarned)
    newErrors.requiredCount = validateField('requiredCount', requiredCount)
    newErrors.note = validateField('note', note)
    
    // Validate conditional fields
    if (isRepeatable) {
      newErrors.repeatType = validateField('repeatType', repeatType)
      newErrors.repeatLimit = validateField('repeatLimit', repeatLimit)
    }
    
    // Image validation - at least one image is required for new badges
    if (!initialData && !image) {
      newErrors.image = 'Badge image is required'
    }
    
    // Validate mutually exclusive options
    if (isOneTimeOnly && isRepeatable) {
      newErrors.conflictingOptions = 'Badge cannot be both "One Time Only" and "Repeatable"'
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
      case 'category':
        setCategory(value)
        break
      case 'unlockCondition':
        setUnlockCondition(value)
        break
      case 'rarity':
        setRarity(value)
        break
      case 'pointEarned':
        setPointEarned(value)
        break
      case 'requiredCount':
        setRequiredCount(value)
        break
      case 'repeatType':
        setRepeatType(value)
        break
      case 'repeatLimit':
        setRepeatLimit(value)
        break
      case 'note':
        setNote(value)
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
      [fieldName]: error,
      // Clear conflicting options error when relevant fields change
      conflictingOptions: ''
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
      case 'category':
        value = category
        break
      case 'unlockCondition':
        value = unlockCondition
        break
      case 'rarity':
        value = rarity
        break
      case 'pointEarned':
        value = pointEarned
        break
      case 'requiredCount':
        value = requiredCount
        break
      case 'repeatType':
        value = repeatType
        break
      case 'repeatLimit':
        value = repeatLimit
        break
      case 'note':
        value = note
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

  // Handle checkbox changes
  const handleCheckboxChange = (fieldName, checked) => {
    if (fieldName === 'isOneTimeOnly') {
      setIsOneTimeOnly(checked)
      if (checked && isRepeatable) {
        setIsRepeatable(false) // Clear repeatable if one time only is selected
        setErrors(prev => ({ ...prev, conflictingOptions: '' }))
      }
    } else if (fieldName === 'isRepeatable') {
      setIsRepeatable(checked)
      if (checked && isOneTimeOnly) {
        setIsOneTimeOnly(false) // Clear one time only if repeatable is selected
        setErrors(prev => ({ ...prev, conflictingOptions: '' }))
      }
      if (!checked) {
        // Clear repeat-related fields and errors when not repeatable
        setRepeatType('')
        setRepeatLimit('1')
        setErrors(prev => ({ 
          ...prev, 
          repeatType: '', 
          repeatLimit: '',
          conflictingOptions: ''
        }))
      }
    }
  }

  // Handle initialData (on edit)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
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
        setBlackWhitePreview(otherImageUrl);
      }
      setCategory(initialData.category || '')
      setIsOneTimeOnly(initialData.isOneTimeOnly || false)
      setIsRepeatable(initialData.isRepeatable || false)
      setRepeatLimit(initialData.repeatLimit || '1')
      setRepeatType(initialData.repeatType || '')
      setNote(initialData.note || '')
      setUnlockCondition(initialData.unlockCondition || '')
      setRarity(initialData.rarity || '')
      setPointEarned(initialData.pointEarned || '')
      setRequiredCount(initialData.requiredCount || '')
    } else {
      // Reset all fields
      setName('')
      setImage(null)
      setOtherImage(null)
      setPreview(null)
      setBlackWhitePreview(null)
      setCategory('')
      setIsOneTimeOnly(false)
      setIsRepeatable(false)
      setRepeatLimit('1')
      setRepeatType('')
      setNote('')
      setUnlockCondition('')
      setRarity('')
      setPointEarned('')
      setRequiredCount('')
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

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
      if (blackWhitePreview && blackWhitePreview.startsWith('blob:')) {
        URL.revokeObjectURL(blackWhitePreview);
      }
    };
  }, [preview, blackWhitePreview]);

  // Image Preview Handlers with validation
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }))
        setTouched(prev => ({ ...prev, image: true }))
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }))
        setTouched(prev => ({ ...prev, image: true }))
        return
      }
      
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setErrors(prev => ({ ...prev, image: '' }))
      setTouched(prev => ({ ...prev, image: true }))
    }
  }

  const handleBlackWhiteImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, otherImage: 'Please select a valid image file' }))
        setTouched(prev => ({ ...prev, otherImage: true }))
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, otherImage: 'Image size must be less than 5MB' }))
        setTouched(prev => ({ ...prev, otherImage: true }))
        return
      }
      
      setOtherImage(file)
      setBlackWhitePreview(URL.createObjectURL(file))
      setErrors(prev => ({ ...prev, otherImage: '' }))
      setTouched(prev => ({ ...prev, otherImage: true }))
    }
  }

  // Form Submit Handler with validation
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate entire form
    const formErrors = validateForm()
    setErrors(formErrors)
    
    // Mark all relevant fields as touched
    setTouched({
      name: true,
      category: true,
      unlockCondition: true,
      rarity: true,
      pointEarned: true,
      requiredCount: true,
      note: true,
      image: true,
      ...(isRepeatable && {
        repeatType: true,
        repeatLimit: true
      })
    })
    
    // If there are errors, don't submit
    if (Object.keys(formErrors).length > 0) {
      // toast.error('Please fix all validation errors before submitting')
      return
    }

    // Collect all badge data
    const data = {
      name: name.trim(),
      category,
      isOneTimeOnly,
      isRepeatable,
      note: note.trim(),
      unlockCondition: unlockCondition.trim(),
      rarity: rarity ? parseInt(rarity) : 1,
      pointEarned: pointEarned ? parseInt(pointEarned) : null,
      requiredCount: requiredCount ? parseInt(requiredCount) : null,
    }
    
    if (isRepeatable) {
      data.repeatLimit = repeatLimit ? parseInt(repeatLimit) : undefined
      data.repeatType = repeatType
    }

    if (image instanceof File) data.image = image;
    if (otherImage instanceof File) data.otherImage = otherImage;
    
    onSubmit(data)
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
            {initialData ? 'Edit Badge' : 'Add Badge'}
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
          {/* Image Upload Sections */}
          <div>
            <div className="flex gap-3 max-md:flex-col">
              <div className="flex-1">
                <span className='text-[#7C7C7C] text-[14px] mb-2 block'>
                  Badge Image {!initialData && <span className="text-red-500">*</span>}
                </span>
                <label className={`
                  flex justify-center items-center border rounded-2xl p-4 h-[210px] cursor-pointer
                  ${errors.image && touched.image ? 'border-red-500' : 'border-[#EFEFEF]'}
                `}>
                  <input
                    type="file"
                    accept="image/*"
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
                      {preview ? 'Change Pic' : 'Add Badge Pic'}
                    </p>
                    <p className="text-[#999999] text-center text-xs mt-1">
                      Max 5MB • JPG, PNG, GIF
                    </p>
                  </div>
                </label>
                {errors.image && touched.image && (
                  <span className="text-red-500 text-xs mt-1 block">{errors.image}</span>
                )}
              </div>

              <div className="flex-1">
                <span className='text-[#7C7C7C] text-[14px] mb-2 block'>
                  Black & White Badge Image
                </span>
                <label className={`
                  flex justify-center items-center border rounded-2xl p-4 h-[210px] cursor-pointer
                  ${errors.otherImage && touched.otherImage ? 'border-red-500' : 'border-[#EFEFEF]'}
                `}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBlackWhiteImageChange}
                  />
                  <div className="flex flex-col justify-center items-center">
                    {blackWhitePreview ? (
                      <img
                        src={blackWhitePreview}
                        alt="Black-white Preview"
                        className="max-h-[150px] mb-[10px] rounded-xl object-contain"
                      />
                    ) : (
                      <img src={addpic_icon} alt="" />
                    )}
                    <p className='text-[#666666] text-center text-sm'>
                      {blackWhitePreview ? 'Change B&W Pic' : 'Add Black-white Badge Pic'}
                    </p>
                    <p className="text-[#999999] text-center text-xs mt-1">
                      Max 5MB • JPG, PNG, GIF
                    </p>
                  </div>
                </label>
                {errors.otherImage && touched.otherImage && (
                  <span className="text-red-500 text-xs mt-1 block">{errors.otherImage}</span>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>
              Badge Name <span className="text-red-500">*</span>
            </span>
            <input
              className={`
                border rounded-2xl py-[14px] px-[18px]
                ${errors.name && touched.name ? 'border-red-500' : 'border-[#EEEEEE]'}
              `}
              type="text"
              placeholder='Enter badge name'
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
              Category <span className="text-red-500">*</span>
            </span>
            <select
              className={`
                border rounded-2xl py-[14px] px-[18px]
                ${errors.category && touched.category ? 'border-red-500' : 'border-[#EEEEEE]'}
              `}
              value={category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              onBlur={() => handleBlur('category')}
            >
              <option value="">Select Category</option>
              <option value="quiz">Quiz</option>
              <option value="wishlist">Wishlist</option>
              <option value="collection">Collection</option>
              <option value="review">Review</option>
              <option value="streak">Streak</option>
              <option value="login">Login</option>
              <option value="scan">Scan</option>
            </select>
            {errors.category && touched.category && (
              <span className="text-red-500 text-xs mt-1">{errors.category}</span>
            )}
          </label>

          {/* Checkbox Options */}
          <div>
            <div className="flex gap-6 flex-wrap">
              <label className='flex items-center gap-2'>
                <input
                  type="checkbox"
                  checked={isOneTimeOnly}
                  onChange={(e) => handleCheckboxChange('isOneTimeOnly', e.target.checked)}
                  className="rounded"
                />
                <span className='text-[#7C7C7C] text-[14px]'>One Time Only</span>
              </label>

              <label className='flex items-center gap-2'>
                <input
                  type="checkbox"
                  checked={isRepeatable}
                  onChange={(e) => handleCheckboxChange('isRepeatable', e.target.checked)}
                  className="rounded"
                />
                <span className='text-[#7C7C7C] text-[14px]'>Is Repeatable</span>
              </label>
            </div>
            {errors.conflictingOptions && (
              <span className="text-red-500 text-xs mt-1 block">{errors.conflictingOptions}</span>
            )}
          </div>

          {/* Conditional Repeatable Fields */}
          {isRepeatable && (
            <>
              <label className='flex flex-col w-full'>
                <span className='text-[#7C7C7C] text-[14px] mb-1'>
                  Repeat Type <span className="text-red-500">*</span>
                </span>
                <select
                  className={`
                    border rounded-2xl py-[14px] px-[18px]
                    ${errors.repeatType && touched.repeatType ? 'border-red-500' : 'border-[#EEEEEE]'}
                  `}
                  value={repeatType}
                  onChange={(e) => handleFieldChange('repeatType', e.target.value)}
                  onBlur={() => handleBlur('repeatType')}
                  required={isRepeatable}
                >
                  <option value="">Select repeat type</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                {errors.repeatType && touched.repeatType && (
                  <span className="text-red-500 text-xs mt-1">{errors.repeatType}</span>
                )}
              </label>

              <label className='flex flex-col w-full'>
                <span className='text-[#7C7C7C] text-[14px] mb-1'>
                  Repeat Limit <span className="text-red-500">*</span>
                </span>
                <input
                  className={`
                    border rounded-2xl py-[14px] px-[18px]
                    ${errors.repeatLimit && touched.repeatLimit ? 'border-red-500' : 'border-[#EEEEEE]'}
                  `}
                  type="number"
                  placeholder='Enter repeat limit'
                  value={repeatLimit}
                  onChange={(e) => handleFieldChange('repeatLimit', e.target.value)}
                  onBlur={() => handleBlur('repeatLimit')}
                  required={isRepeatable}
                  min="1"
                  max="100"
                />
                {errors.repeatLimit && touched.repeatLimit && (
                  <span className="text-red-500 text-xs mt-1">{errors.repeatLimit}</span>
                )}
              </label>
            </>
          )}

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Note</span>
            <textarea
              className={`
                border rounded-2xl py-[14px] px-[18px] min-h-[80px] resize-none
                ${errors.note && touched.note ? 'border-red-500' : 'border-[#EEEEEE]'}
              `}
              placeholder='Enter additional notes (optional)'
              value={note}
              onChange={(e) => handleFieldChange('note', e.target.value)}
              onBlur={() => handleBlur('note')}
            />
            {errors.note && touched.note && (
              <span className="text-red-500 text-xs mt-1">{errors.note}</span>
            )}
            <span className="text-gray-500 text-xs mt-1">
              {note.length}/500 characters
            </span>
          </label>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>
              Unlock Condition <span className="text-red-500">*</span>
            </span>
            <input
              className={`
                border rounded-2xl py-[14px] px-[18px]
                ${errors.unlockCondition && touched.unlockCondition ? 'border-red-500' : 'border-[#EEEEEE]'}
              `}
              type="text"
              placeholder='e.g., Complete 5 quizzes, Add 10 perfumes to wishlist'
              value={unlockCondition}
              onChange={(e) => handleFieldChange('unlockCondition', e.target.value)}
              onBlur={() => handleBlur('unlockCondition')}
            />
            {errors.unlockCondition && touched.unlockCondition && (
              <span className="text-red-500 text-xs mt-1">{errors.unlockCondition}</span>
            )}
            <span className="text-gray-500 text-xs mt-1">
              {unlockCondition.length}/200 characters
            </span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className='flex flex-col w-full'>
              <span className='text-[#7C7C7C] text-[14px] mb-1'>
                Rarity <span className="text-red-500">*</span>
              </span>
              <select
                className={`
                  border rounded-2xl py-[14px] px-[18px]
                  ${errors.rarity && touched.rarity ? 'border-red-500' : 'border-[#EEEEEE]'}
                `}
                value={rarity}
                onChange={(e) => handleFieldChange('rarity', e.target.value)}
                onBlur={() => handleBlur('rarity')}
              >
                <option value="">Select Rarity</option>
                <option value="1">Common</option>
                <option value="2">Uncommon</option>
                <option value="3">Rare</option>
              </select>
              {errors.rarity && touched.rarity && (
                <span className="text-red-500 text-xs mt-1">{errors.rarity}</span>
              )}
            </label>

            <label className='flex flex-col w-full'>
              <span className='text-[#7C7C7C] text-[14px] mb-1'>
                Point Earned <span className="text-red-500">*</span>
              </span>
              <input
                className={`
                  border rounded-2xl py-[14px] px-[18px]
                  ${errors.pointEarned && touched.pointEarned ? 'border-red-500' : 'border-[#EEEEEE]'}
                `}
                type="number"
                placeholder='Enter points (0-10000)'
                value={pointEarned}
                onChange={(e) => handleFieldChange('pointEarned', e.target.value)}
                onBlur={() => handleBlur('pointEarned')}
                min="0"
                max="10000"
              />
              {errors.pointEarned && touched.pointEarned && (
                <span className="text-red-500 text-xs mt-1">{errors.pointEarned}</span>
              )}
            </label>
          </div>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>
              Required Count <span className="text-red-500">*</span>
            </span>
            <input
              className={`
                border rounded-2xl py-[14px] px-[18px]
                ${errors.requiredCount && touched.requiredCount ? 'border-red-500' : 'border-[#EEEEEE]'}
              `}
              type="number"
              placeholder='Enter required count (1-1000)'
              value={requiredCount}
              onChange={(e) => handleFieldChange('requiredCount', e.target.value)}
              onBlur={() => handleBlur('requiredCount')}
              min="1"
              max="1000"
            />
            {errors.requiredCount && touched.requiredCount && (
              <span className="text-red-500 text-xs mt-1">{errors.requiredCount}</span>
            )}
            <span className="text-gray-500 text-xs mt-1">
              Number of actions required to unlock this badge
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
            className='btn-pri disabled:opacity-50 disabled:cursor-not-allowed' 
            type="submit"
            disabled={Object.keys(errors).some(key => errors[key])}
          >
            {initialData ? 'Save Changes' : 'Add Badge'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddBadge
