'use client';

export default function MenuItem({ item, onSelect, compact = false }) {
  if (compact) {
    return (
      <div 
        onClick={onSelect}
        className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
      >
        {item.imageUrl && (
          <div className="h-32 bg-gray-100 overflow-hidden">
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
          <p className="text-sm text-gray-600 truncate">{item.description}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="font-bold text-purple-600">${item.price?.toFixed(2)}</span>
            <button className="text-purple-600 hover:text-purple-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onSelect}
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {item.imageUrl && (
        <div className="h-48 bg-gray-100 overflow-hidden">
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
          <span className="font-bold text-purple-600">${item.price?.toFixed(2)}</span>
        </div>
        <p className="text-gray-600 text-sm mt-2">{item.description}</p>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Add to Order
        </button>
      </div>
    </div>
  );
}