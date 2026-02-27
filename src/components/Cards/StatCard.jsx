const StatCard = ({ icon, title, value, description }) => {
  return (
    <div className="bg-white p-6 rounded-2xl w-full h-full flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-2xl bg-[#F0F4FF] flex items-center justify-center group-hover:bg-[#352AA4] transition-colors duration-300">
          <img
            src={icon}
            alt={`${title} icon`}
            className="w-7 h-7 filter brightness-0 opacity-70 group-hover:filter-none group-hover:brightness-0 group-hover:invert transition-all duration-300"
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-500 mb-1 truncate" title={title}>{title}</p>
        <h3 className="text-2xl font-bold text-[#352AA4] truncate" title={value}>{value}</h3>
        {description && (
          <p className="text-xs text-slate-400 mt-2 font-medium">{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
