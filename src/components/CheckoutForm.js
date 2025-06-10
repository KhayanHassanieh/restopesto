'use client';
import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function CheckoutForm({ 
  restaurantId,
  cartTotal, 
  onBack, 
  onComplete, 
  defaultRegion = 'Mount Lebanon' 
}) {
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    region: defaultRegion,
    area: '',
    addressDetails: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedBranchAreas, setSelectedBranchAreas] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchesSnapshot = await getDocs(
          collection(db, 'restaurants', restaurantId, 'branches')
        );
        const branchesData = branchesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          areas: Array.isArray(doc.data().areas) 
            ? doc.data().areas 
            : Object.values(doc.data().areas || {})
        }));
        setBranches(branchesData);
      } catch (error) {
        console.error('Error fetching branches:', error);
      } finally {
        setLoadingBranches(false);
      }
    };

    if (restaurantId) fetchBranches();
  }, [restaurantId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'region') {
      const selectedBranch = branches.find(b => b.city === value);
      setSelectedBranchAreas(selectedBranch?.areas || []);
      setFormData(prev => ({ ...prev, area: '' , branchId: selectedBranch?.id || '' })); // Reset area when region changes
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = (e) => {
  e.preventDefault();
  const newErrors = {};

  // Full name check
  if (!formData.fullName.trim()) {
    newErrors.fullName = 'Full name is required.';
  }

  // Mobile number validation (Lebanese: starts 3-9, 7 or 8 digits)
  if (!/^[3-9]\d{6,7}$/.test(formData.mobileNumber)) {
    newErrors.mobileNumber = 'Enter a valid 7 or 8-digit Lebanese number.';
  }

  if (!formData.region) {
    newErrors.region = 'Region is required.';
  }

  if (!formData.area) {
    newErrors.area = 'Area is required.';
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setErrors({});
  onComplete(formData);
};


  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Address Details</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--theme-primary)] text-gray-800 placeholder:text-gray-500"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <div className="flex">
              <select 
                className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50  text-gray-800"
                value="+961"
                disabled
              >
                <option value="+961" >+961</option>
              </select>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] text-gray-800 placeholder:text-gray-500"
                placeholder="71123321"
              />
              
            </div>
            {errors.mobileNumber && (
  <p className="text-sm text-red-600 mt-1">{errors.mobileNumber}</p>
)}
          </div>

          {/* Region */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Region
  </label>
  <select
    name="region"
    value={formData.region}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] text-gray-800 placeholder:text-gray-500"
    required
  >
    <option value="">Select a region</option>
    {branches.map(branch => (
      <option key={branch.id} value={branch.city} data-id={branch.id}>
  {branch.city}
</option>

    ))}
  </select>
</div>

          {/* Area */}
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Area
  </label>
  <select
    name="area"
    value={formData.area}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] text-gray-800 placeholder:text-gray-500"
    required
    disabled={!formData.region}
  >
    <option value="">Select an area</option>
    {selectedBranchAreas.map((area, index) => (
      <option key={index} value={area}>
        {area}
      </option>
    ))}
  </select>
</div>

          {/* Address Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Details
            </label>
            <textarea
              name="addressDetails"
              value={formData.addressDetails}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] text-gray-800 placeholder:text-gray-500"
              placeholder="Building name, floor, nearby landmarks"
            required
            />
          </div>
        </div>

        <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Previous
          </button>
          <button
            type="submit"
            className="px-4 py-2  text-white rounded-md hover:brightness-110 transition-colors" style={{
                    background: 'var(--theme-primary)',

                  }}
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}