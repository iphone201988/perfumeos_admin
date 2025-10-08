import React, { useState, useEffect } from 'react'
import cross_icon from '../../assets/icons/cross-icon.svg'
import addpic_icon from '../../assets/icons/addpic-icon.svg'

const AddArticle = ({ open, onClose, onSubmit, initialData = null }) => {
  // State for form fields
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  
  // Validation state
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Validation rules
  const validation = {
    title: {
      required: true,
      minLength: 3,
      maxLength: 100,
      message: 'Title must be between 3 and 100 characters'
    },
    content: {
      required: true,
      minLength: 10,
      maxLength: 2000,
      message: 'Content must be between 10 and 2000 characters'
    },
    image: {
      required: false,
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
      message: 'Image must be JPEG, PNG, or WebP format and under 5MB'
    }
  }

  // Validation function
  const validateField = (name, value, file = null) => {
    const rule = validation[name]
    if (!rule) return ''

    // Required field validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`
    }

    // String length validation
    if (value && rule.minLength && value.toString().length < rule.minLength) {
      return rule.message
    }
    if (value && rule.maxLength && value.toString().length > rule.maxLength) {
      return rule.message
    }

    // File validation
    if ((name === 'image' || name === 'preview') && file) {
      if (file.size > rule.maxSize) {
        return 'Image size must be under 5MB'
      }
      if (!rule.allowedTypes.includes(file.type)) {
        return 'Only JPEG, PNG, and WebP images are allowed'
      }
    }

    return ''
  }

  // Real-time validation
  const handleValidation = (name, value, file = null) => {
    const error = validateField(name, value, file)
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
    return error === ''
  }

  // Handle field blur (mark as touched)
  const handleBlur = (name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
  }

  // Title change handler with validation
  const handleTitleChange = (e) => {
    const value = e.target.value
    setTitle(value)
    if (touched.title || value.length > 0) {
      handleValidation('title', value)
    }
  }

  // Content change handler with validation
  const handleContentChange = (e) => {
    const value = e.target.value
    setContent(value)
    if (touched.content || value.length > 0) {
      handleValidation('content', value)
    }
  }

  // Handle initialData (on edit)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setContent(initialData.content || '')
      setImage(initialData.image || null)
      setPreview(initialData.image || null)
    } else {
      setTitle('')
      setContent('')
      setImage(null)
      setPreview(null)
    }
    // Reset validation state
    setErrors({})
    setTouched({})
  }, [initialData, open])

  // Enhanced image change handler with validation
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const isValid = handleValidation('image', 'image', file)
      if (isValid) {
        setImage(file)
        setPreview(URL.createObjectURL(file))
      } else {
        // Clear file input if validation fails
        e.target.value = ''
      }
    }
  }

  // Form validation check
  const isFormValid = () => {
    const titleValid = validateField('title', title) === ''
    const contentValid = validateField('content', content) === ''
    const imageValid = !image || validateField('image', 'image', image) === ''
    
    return titleValid && contentValid && imageValid && title.trim() && content.trim()
  }

  // Form Submit Handler with comprehensive validation
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouched({
      title: true,
      content: true,
      image: true
    })

    // Validate all fields
    const titleError = validateField('title', title)
    const contentError = validateField('content', content)
    const imageError = image ? validateField('image', 'image', image) : ''

    setErrors({
      title: titleError,
      content: contentError,
      image: imageError
    })

    // Check if form is valid
    if (titleError || contentError || imageError) {
      return
    }

    // Additional checks
    if (title.trim() === '' || content.trim() === '') {
      return
    }

    // Collect the article data
    const data = {
      title: title.trim(),
      content: content.trim(),
      image,
    }
    
    onSubmit(data)
    
    // Reset fields after successful submission
    setTitle('')
    setContent('')
    setImage(null)
    setPreview(null)
    setErrors({})
    setTouched({})
    onClose()
  }

  // Character counter component
  const CharacterCounter = ({ current, max, name }) => (
    <div className={`text-xs mt-1 ${current > max ? 'text-red-500' : 'text-gray-500'}`}>
      {current}/{max} characters
      {current > max && <span className="ml-2 text-red-500">Exceeds limit</span>}
    </div>
  )

  // Error message component
  const ErrorMessage = ({ error, touched }) => (
    touched && error && (
      <div className="text-red-500 text-sm mt-1 flex items-center">
        <span className="ml-1">{error}</span>
      </div>
    )
  )

  // Auto-close modal if not open
  if (!open) return null

  return (
    <div className='w-full p-[20px] min-h-[100vh] fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center max-md:p-[20px]'>
      <form
        onSubmit={handleSubmit}
        className="bg-[#fff] p-[32px] h-full rounded-[24px] max-w-[600px] w-full max-md:p-[16px] max-md:overflow-scroll max-md:h-[600px]"
        autoComplete="off"
        noValidate
      >
        <div className="flex items-center justify-between">
          <h5 className='text-[20px] text-[#352AA4] font-semibold'>
            {initialData ? 'Edit Article' : 'Add Article'}
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

        <div className="mt-[20px] flex flex-col gap-[16px]">
          {/* Image Upload with Validation */}
          <div>
            <label className={`flex justify-center items-center border rounded-2xl p-[16px] h-[210px] cursor-pointer transition-colors ${
              errors.image && touched.image 
                ? 'border-red-500 bg-red-50' 
                : 'border-[#EFEFEF] hover:border-gray-300'
            }`}>
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
                <p className={`${errors.image && touched.image ? 'text-red-500' : 'text-[#666666]'}`}>
                  {preview ? 'Change Picture' : 'Add Article Picture'}
                </p>
              </div>
            </label>
            <ErrorMessage error={errors.image} touched={touched.image} />
          </div>

          {/* Title Field with Validation */}
          <div className="flex gap-[12px] max-md:flex-wrap">
            <label className='flex flex-col w-full'>
              <span className='text-[#7C7C7C] text-[14px]'>
                Article Title <span className="text-red-500">*</span>
              </span>
              <input
                className={`border rounded-2xl py-[14px] px-[18px] transition-colors ${
                  errors.title && touched.title 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-[#EEEEEE] focus:border-blue-500'
                }`}
                type="text"
                placeholder='Enter article title'
                value={title}
                onChange={handleTitleChange}
                onBlur={() => handleBlur('title')}
                maxLength={validation.title.maxLength}
                required
              />
              <CharacterCounter 
                current={title.length} 
                max={validation.title.maxLength} 
                name="title" 
              />
              <ErrorMessage error={errors.title} touched={touched.title} />
            </label>
          </div>

          {/* Content Field with Validation */}
          <div className="flex gap-[12px] max-md:flex-wrap">
            <label className='flex flex-col w-full'>
              <span className='text-[#7C7C7C] text-[14px]'>
                Content <span className="text-red-500">*</span>
              </span>
              <textarea
                className={`border rounded-2xl py-[14px] px-[18px] h-[220px] transition-colors resize-none ${
                  errors.content && touched.content 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-[#EEEEEE] focus:border-blue-500'
                }`}
                placeholder='Enter article content'
                value={content}
                onChange={handleContentChange}
                onBlur={() => handleBlur('content')}
                maxLength={validation.content.maxLength}
                required
              />
              <CharacterCounter 
                current={content.length} 
                max={validation.content.maxLength} 
                name="content" 
              />
              <ErrorMessage error={errors.content} touched={touched.content} />
            </label>
          </div>
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
            className={`btn-pri transition-opacity ${
              !isFormValid() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
            }`} 
            type="submit"
            // disabled={!isFormValid()}
          >
            {initialData ? 'Save Changes' : 'Add Article'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddArticle
