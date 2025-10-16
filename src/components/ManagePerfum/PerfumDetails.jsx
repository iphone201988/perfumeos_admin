import React, { useState } from "react";
import addpic_icon from "../../assets/icons/addpic-icon.svg";
import user_icon from "../../assets/icons/addpic-icon.svg";
import { useNavigate, useParams } from "react-router-dom";
import { useDeletePerfumeMutation, useGetPerfumeByIdQuery } from "../../api";
import ConfirmationModal from "../Modal/ConfirmationModal";
import Loader from "../Loader/Loader";

const PerfumDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { data: perfumeData, isLoading, error } = useGetPerfumeByIdQuery(params.id);
  const [deletePerfume] = useDeletePerfumeMutation();
  const [isDeleted, setIsDeleted] = useState(false);

  // Image gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (isLoading) {
    return <Loader message="Loading Perfume Details" />;
  }
  if (error || !perfumeData) return <div>Error loading perfume details.</div>;
  const perfume = perfumeData.data;

  if (params?.id === "24") {
    navigate("/perfumes");
    return null;
  }

  // Combine all images (primary image + additional images)
  const allImages = [
    perfume.image,
    ...perfume.images.filter(image => image !== perfume.image) // Filter out primary image
  ].filter(Boolean); // Remove null/undefined values

  const onEdit = () => {
    navigate(`/perfumes/${params.id}/edit`);
  };

  const handleDelete = async () => {
    await deletePerfume(params.id);
    setIsDeleted(false);
    navigate("/perfumes");
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return addpic_icon;
    return imageUrl.startsWith("http")
      ? imageUrl
      : `${import.meta.env.VITE_BASE_URL}${imageUrl}`;
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleKeyDown = (e) => {
    if (!isFullscreen) return;

    if (e.key === 'ArrowLeft') {
      handlePrevImage();
    } else if (e.key === 'ArrowRight') {
      handleNextImage();
    } else if (e.key === 'Escape') {
      setIsFullscreen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Action Buttons */}
      <div className="flex justify-end gap-[16px] mb-[32px] flex-wrap">
        <button
          onClick={() => navigate("/perfumes")}
          className="bg-white text-[#352AA4] text-sm border-2 border-[#352AA4]/20 rounded-full px-6 py-3 transition-all duration-300 hover:bg-gray-50 hover:border-[#352AA4] hover:shadow-md flex items-center gap-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          type="button"
          disabled={isLoading}
        >
          <span className="text-lg">←</span>
          Back
        </button>
        <button
          onClick={() => setIsDeleted(true)}
          className="bg-red-500 text-white text-sm border-2 border-red-500 rounded-full px-6 py-3 transition-all duration-300 hover:bg-red-600 hover:shadow-md font-medium"
        >
          Remove Perfume
        </button>
        <button
          onClick={onEdit}
          className="bg-[#352AA4] text-white text-sm border-2 border-[#352AA4] rounded-full px-6 py-3 transition-all duration-300 hover:bg-[#2a2183] hover:shadow-md font-medium"
        >
          Edit Details
        </button>
      </div>

      <div className="bg-gradient-to-br from-[#E1F8F8] to-[#D4E8F8] rounded-[30px] shadow-lg overflow-hidden">
        <div className="bg-white/60 backdrop-blur-sm rounded-[30px] p-[32px] max-lg:p-[20px] m-[2px]">

          {/* Hero Section - Image Gallery and Primary Details */}
          <div className="flex gap-[40px] items-start max-md:flex-col">

            {/* Image Gallery Section */}
            <div className="flex-shrink-0">
              <div className="relative group">
                {/* Main Image Display */}
                <div className="flex justify-center items-center bg-gradient-to-br from-white to-gray-50 border-2 border-[#352AA4]/10 rounded-3xl p-[16px] h-[320px] w-[320px] shadow-md transition-all duration-300 group-hover:shadow-xl overflow-hidden relative">
                  <img
                    src={getImageUrl(allImages[selectedImageIndex])}
                    alt={`${perfume.name} - Image ${selectedImageIndex + 1}`}
                    className="object-contain max-h-[280px] drop-shadow-lg cursor-pointer transition-transform duration-300 hover:scale-110"
                    onClick={() => setIsFullscreen(true)}
                  />

                  {/* Image Counter Badge */}
                  {allImages.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      {selectedImageIndex + 1} / {allImages.length}
                    </div>
                  )}

                  {/* Fullscreen Icon */}
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="absolute top-4 left-4 bg-white/90 hover:bg-white p-2 rounded-lg shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="View fullscreen"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>

                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                        aria-label="Previous image"
                      >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                        aria-label="Next image"
                      >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {/* {allImages.length > 1 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-110 hover:shadow-md ${
                          selectedImageIndex === index
                            ? 'border-[#352AA4] ring-2 ring-[#352AA4] ring-offset-2'
                            : 'border-gray-200 hover:border-[#352AA4]/50'
                        }`}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )} */}

                {/* Decorative corner accent */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full opacity-20"></div>
              </div>
            </div>

            {/* Product Information */}
            <div className="flex-1 space-y-[20px]">
              <div>
                <h1 className="text-[32px] font-bold text-[#352AA4] mb-2 max-md:text-[24px]">
                  {perfume.name}
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 gap-[16px]">
                {/* Brand */}
                <div className="flex items-center gap-3 bg-white/80 rounded-2xl p-[16px] shadow-sm border border-[#352AA4]/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#352AA4] to-[#5c4ec9] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    B
                  </div>
                  <div>
                    <span className="text-[#7C7C7C] text-xs block">Brand Name</span>
                    <span className="font-semibold text-[16px] text-[#352AA4]">{perfume.brand}</span>
                  </div>
                </div>

                {/* Year and Intended For in Grid */}
                <div className="grid grid-cols-2 gap-[16px] max-md:grid-cols-1">
                  {perfume?.year && (
                    <div className="bg-white/80 rounded-2xl p-[16px] shadow-sm border border-[#352AA4]/10">
                      <span className="text-[#7C7C7C] text-xs block mb-1">Year</span>
                      <span className="font-semibold text-[16px] text-gray-800">
                        {perfume.year}
                      </span>
                    </div>
                  )}
                  {perfume?.concentration && (
                    <div className="bg-white/80 rounded-2xl p-[16px] shadow-sm border border-[#352AA4]/10">
                      <span className="text-[#7C7C7C] text-xs block mb-1">Concentration</span>
                      <span className="font-semibold text-[16px] text-gray-800">
                        {perfume.concentration}
                      </span>
                    </div>
                  )}

                  {perfume.intendedFor && (
                    <div className="bg-white/80 rounded-2xl p-[16px] shadow-sm border border-[#352AA4]/10">
                      <span className="text-[#7C7C7C] text-xs block mb-1">Intended For</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(perfume.intendedFor || []).map((intent, idx) => (
                          <span
                            key={idx}
                            className="capitalize font-medium text-sm bg-[#352AA4]/10 text-[#352AA4] px-3 py-1 rounded-full"
                          >
                            {intent}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fragrance Pyramid Section */}
          {(perfume?.notes?.base?.length > 0 || perfume?.notes?.middle?.length > 0 || perfume?.notes?.top?.length > 0 || perfume?.notes?.note?.length > 0) && (
            <div className="mt-[40px] bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
              <h3 className="text-[24px] font-bold text-[#352AA4] mb-[24px] flex items-center gap-2">
                <span className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></span>
                Fragrance Pyramid
              </h3>

              <div className="space-y-[24px]">
                {["top", "middle", "base", "note"].map((layer) => {
                  const notes = perfume.notes?.[layer];
                  if (notes && notes.length > 0) {
                    return (
                      <div key={layer} className="border-b border-[#E1F8F8] last:border-0 pb-[20px] last:pb-0">
                        <div className="flex items-center gap-2 mb-[16px]">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#352AA4] to-[#5c4ec9] rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{layer.charAt(0).toUpperCase()}</span>
                          </div>
                          <h4 className="text-[#352AA4] text-[18px] font-semibold capitalize">
                            {layer} notes
                          </h4>
                        </div>

                        <div className="flex flex-wrap gap-[16px]">
                          {notes.map((note) => (
                            <div
                              key={note._id || note.noteId._id}
                              className="flex flex-col items-center w-[100px] bg-white rounded-xl p-[12px] shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-gray-100"
                            >
                              <div className="w-[60px] h-[60px] rounded-full overflow-hidden mb-2 border-2 border-[#352AA4]/20">
                                <img
                                  src={
                                    note?.noteId?.bgUrl
                                      ? note?.noteId?.bgUrl.startsWith("blob:") || note?.noteId?.bgUrl.startsWith("http")
                                        ? note?.noteId?.bgUrl
                                        : `${import.meta.env.VITE_BASE_URL}${note?.noteId?.bgUrl}`
                                      : user_icon
                                  }
                                  alt={note.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-[13px] text-center font-medium text-gray-700 leading-tight">
                                {note?.noteId?.name || note.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          {/* Main Accords Section */}
          <div className="mt-[32px] bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
            <h3 className="text-[24px] font-bold text-[#352AA4] mb-[20px] flex items-center gap-2">
              <span className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></span>
              Main Accords
            </h3>
            <div className="space-y-[16px]">
              {perfume.mainAccords?.map((accord) => (
                <div key={accord._id} className="group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[14px] font-medium text-gray-700">{accord.name}</span>
                    <span className="text-xs text-[#352AA4] font-semibold">{accord.width}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-[20px] overflow-hidden shadow-inner">
                    <div
                      style={{
                        width: accord.width,
                        backgroundColor: accord.backgroundColor,
                      }}
                      className="h-full rounded-full transition-all duration-500 group-hover:opacity-90"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Season & Occasions Grid */}
          <div className="mt-[32px] grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            {/* Season */}
            <div className="bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
              <h3 className="text-[20px] font-bold text-[#352AA4] mb-[16px] flex items-center gap-2">
                <span className="text-2xl">🌸</span>
                Season
              </h3>
              <div className="space-y-[12px]">
                {perfume.seasons?.map((season) => (
                  <div key={season._id} className="flex justify-between items-center bg-gray-50 rounded-lg px-[16px] py-[12px] hover:bg-gray-100 transition-colors">
                    <span className="font-medium text-gray-700 capitalize">{season.name}</span>
                    <span className="text-[#352AA4] font-bold">{Math.round(parseFloat(season.width))}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Occasion */}
            <div className="bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
              <h3 className="text-[20px] font-bold text-[#352AA4] mb-[16px] flex items-center gap-2">
                <span className="text-2xl">✨</span>
                Occasion
              </h3>
              <div className="space-y-[12px]">
                <div className="flex justify-between items-center bg-gray-50 rounded-lg px-[16px] py-[12px] hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-700 capitalize">{"Day"}</span>
                  <span className="text-[#352AA4] font-bold">
                    {((perfume?.occasionVotes?.day * 100) / perfume?.occasionVotes?.total) || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 rounded-lg px-[16px] py-[12px] hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-700 capitalize">{"Night"}</span>
                  <span className="text-[#352AA4] font-bold">
                    {((perfume?.occasionVotes?.night * 100) / perfume?.occasionVotes?.total) || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Perfumer Section */}
          {perfume.perfumers && perfume.perfumers.length > 0 && (
            <div className="mt-[32px] bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
              <h3 className="text-[24px] font-bold text-[#352AA4] mb-[20px] flex items-center gap-2">
                <span className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></span>
                Perfumer
              </h3>
              <div className="flex gap-[24px] flex-wrap">
                {perfume.perfumers.map((p) => (
                  <div
                    key={p._id}
                    className="flex flex-col items-center bg-white rounded-xl p-[16px] shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100 min-w-[140px]"
                  >
                    <div className="w-[80px] h-[80px] rounded-full overflow-hidden mb-3 border-4 border-[#352AA4]/20 shadow-md">
                      <img
                        src={
                          p?.perfumerId?.smallImage
                            ? p?.perfumerId?.smallImage.startsWith("blob:") || p?.perfumerId?.smallImage.startsWith("http")
                              ? p?.perfumerId?.smallImage
                              : `${import.meta.env.VITE_BASE_URL}${p?.perfumerId?.smallImage}`
                            : user_icon
                        }
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-center font-semibold text-gray-800">{p?.perfumerId?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="mt-[32px] bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
            <h3 className="text-[24px] font-bold text-[#352AA4] mb-[16px] flex items-center gap-2">
              <span className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></span>
              Description
            </h3>
            <p className="text-[15px] text-gray-700 leading-relaxed">{perfume.description}</p>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-200 z-10"
            aria-label="Close fullscreen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
          )}

          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={getImageUrl(allImages[selectedImageIndex])}
              alt={`${perfume.name} - Fullscreen`}
              className="max-w-full max-h-full object-contain drop-shadow-2xl"
            />

            {/* Navigation Arrows for Fullscreen */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-full transition-all duration-200 hover:scale-110"
                  aria-label="Previous image"
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-full transition-all duration-200 hover:scale-110"
                  aria-label="Next image"
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip in Fullscreen */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-4xl overflow-x-auto">
              <div className="flex gap-2 px-4">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(index);
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-110 ${selectedImageIndex === index
                        ? 'border-white ring-2 ring-white'
                        : 'border-white/30 hover:border-white/70'
                      }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isDeleted && (
        <ConfirmationModal
          isOpen={isDeleted}
          onClose={() => setIsDeleted(false)}
          onConfirm={handleDelete}
          message="Are you sure you want to delete this perfume?"
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }

        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }

        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background-color: #f3f4f6;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default PerfumDetails;
