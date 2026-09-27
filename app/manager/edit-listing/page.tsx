"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { NYCApartmentListing } from "@/lib/data";
import { textStyles, inputStyles, buttonStyles } from "@/lib/styles";
import HavenLogo from "@/components/HavenLogo";
import DarkModeToggle from "@/components/DarkModeToggle";
import { getManagerListingsNYC, updateListingNYC, Promotion } from "@/lib/listings";
import { geocodeAddress } from "@/lib/geocoding";

function EditListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoggedIn, isManager } = useUser();
  const listingId = searchParams.get("id");
  const [originalListing, setOriginalListing] = useState<NYCApartmentListing | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    yearBuilt: "",
    renovationYear: "",
    description: "",
    availableFrom: "",
    images: "",
    outdoorArea: "None",
    view: "None",
    applyUrl: "",
    contactPhone: "",
    contactEmail: "",
  });
  const [amenities, setAmenities] = useState({
    washerDryerInUnit: false,
    washerDryerInBuilding: false,
    dishwasher: false,
    ac: false,
    pets: false,
    fireplace: false,
    gym: false,
    parking: false,
    pool: false,
  });
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geocodingFailed, setGeocodingFailed] = useState(false);
  const [originalAddress, setOriginalAddress] = useState("");

  useEffect(() => {
    // Redirect if not logged in or not a manager
    if (!isLoggedIn) {
      router.push("/");
      return;
    }
    if (!isManager) {
      router.push("/swipe");
      return;
    }

    // Load listing from Supabase
    const loadListing = async () => {
      if (!listingId || !user) return;

      const nycListings = await getManagerListingsNYC(user.id);
      const listing = nycListings.find(l => l.id === listingId);

      if (listing) {
        setOriginalListing(listing);

        // Set amenities checkboxes
        setAmenities({
          washerDryerInUnit: listing.amenities.washerDryerInUnit || false,
          washerDryerInBuilding: listing.amenities.washerDryerInBuilding || false,
          dishwasher: listing.amenities.dishwasher || false,
          ac: listing.amenities.ac || false,
          pets: listing.amenities.pets || false,
          fireplace: listing.amenities.fireplace || false,
          gym: listing.amenities.gym || false,
          parking: listing.amenities.parking || false,
          pool: listing.amenities.pool || false,
        });

        setFormData({
          title: listing.title,
          address: listing.address,
          price: listing.price.toString(),
          bedrooms: listing.bedrooms.toString(),
          bathrooms: listing.bathrooms.toString(),
          sqft: listing.sqft.toString(),
          yearBuilt: listing.yearBuilt?.toString() || "",
          renovationYear: listing.renovationYear?.toString() || "",
          description: listing.description || "",
          availableFrom: listing.dateAvailable || "",
          images: listing.images.join("\n"),
          outdoorArea: listing.amenities.outdoorArea || "None",
          view: listing.amenities.view || "None",
          applyUrl: listing.apply_url || "",
          contactPhone: listing.contact_phone || "",
          contactEmail: listing.contact_email || "",
        });
        setOriginalAddress(listing.address);
        setPromotions(listing.promotions || []);
      } else {
        setError("Listing not found");
      }
    };

    loadListing();
  }, [isLoggedIn, isManager, router, user, listingId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Reset geocoding validation if address changes
    if (e.target.name === 'address') {
      setGeocodingFailed(false);
      setWarning("");
    }
  };

  const handleAmenityToggle = (amenity: keyof typeof amenities) => {
    setAmenities(prev => ({
      ...prev,
      [amenity]: !prev[amenity]
    }));
  };

  const addPromotion = () => {
    setPromotions(prev => [...prev, { leaseTermMonths: 12, type: 'months_free', value: 1 }]);
  };

  const removePromotion = (index: number) => {
    setPromotions(prev => prev.filter((_, i) => i !== index));
  };

  const updatePromotion = (index: number, field: keyof Promotion, value: any) => {
    setPromotions(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setWarning("");
    setIsSubmitting(true);

    try {
      if (!user || !listingId || !originalListing) {
        setError("Invalid listing");
        setIsSubmitting(false);
        return;
      }

      // Validate required fields
      if (!formData.title || !formData.address || !formData.price || !formData.bedrooms || !formData.bathrooms || !formData.yearBuilt) {
        setError("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      if (!formData.applyUrl) {
        setError("Application URL is required so renters can apply");
        setIsSubmitting(false);
        return;
      }

      // Parse image URLs
      const imageUrls = formData.images
        .split("\n")
        .map(url => url.trim())
        .filter(url => url.length > 0);

      if (imageUrls.length === 0) {
        setError("Please add at least one image URL");
        setIsSubmitting(false);
        return;
      }

      // Validate address via geocoding if it changed (unless user already confirmed)
      if (formData.address !== originalAddress && !geocodingFailed) {
        const coords = await geocodeAddress(formData.address);
        if (!coords) {
          setWarning("We couldn't find this address. Are you sure that's the right address? Click 'Update Listing' again to proceed anyway.");
          setGeocodingFailed(true);
          setIsSubmitting(false);
          return;
        }
      }

      // Update listing in database
      const success = await updateListingNYC(listingId, {
        title: formData.title,
        address: formData.address,
        price: parseInt(formData.price, 10),
        bedrooms: parseInt(formData.bedrooms, 10),
        bathrooms: parseFloat(formData.bathrooms),
        sqft: parseInt(formData.sqft) || 0,
        yearBuilt: parseInt(formData.yearBuilt),
        renovationYear: formData.renovationYear ? parseInt(formData.renovationYear) : null,
        description: formData.description,
        dateAvailable: formData.availableFrom,
        images: imageUrls,
        washerDryerInUnit: amenities.washerDryerInUnit,
        washerDryerInBuilding: amenities.washerDryerInBuilding,
        dishwasher: amenities.dishwasher,
        ac: amenities.ac,
        pets: amenities.pets,
        fireplace: amenities.fireplace,
        gym: amenities.gym,
        parking: amenities.parking,
        pool: amenities.pool,
        outdoorArea: formData.outdoorArea,
        view: formData.view,
        promotions,
        apply_url: formData.applyUrl,
        contact_phone: formData.contactPhone || undefined,
        contact_email: formData.contactEmail || undefined,
      });

      // Price and promo changes are automatically tracked in updateListingNYC

      if (success) {
        // Redirect to dashboard
        router.push("/manager/dashboard");
      } else {
        setError("Failed to update listing in database. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("Failed to update listing. Please check your inputs.");
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn || !isManager) {
    return null;
  }

  if (!originalListing) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <p className={textStyles.headingSmall}>{error || "Loading..."}</p>
          <button
            onClick={() => router.push("/manager/dashboard")}
            className={`${buttonStyles.primary} mt-4`}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HavenLogo size="sm" showAnimation={false} />
              <h1 className={`${textStyles.heading} text-xl`}>Edit Listing</h1>
            </div>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <button
                onClick={() => router.push("/manager/dashboard")}
                className={buttonStyles.secondary}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className={inputStyles.label}>
                Listing Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Modern Studio in Westwood"
                className={inputStyles.standard}
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className={inputStyles.label}>
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g., 1234 Main St, Los Angeles, CA 90024"
                className={inputStyles.standard}
                required
              />
            </div>

            {/* Price, Bedrooms, Bathrooms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={inputStyles.label}>
                  Price ($/month) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  onBlur={handleChange}
                  placeholder="2500"
                  className={inputStyles.standard}
                  required
                />
              </div>
              <div>
                <label className={inputStyles.label}>
                  Bedrooms <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="1"
                  className={inputStyles.standard}
                  required
                  min="0"
                  step="1"
                />
              </div>
              <div>
                <label className={inputStyles.label}>
                  Bathrooms <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  placeholder="1"
                  className={inputStyles.standard}
                  required
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            {/* Square Footage */}
            <div>
              <label className={inputStyles.label}>
                Square Footage
              </label>
              <input
                type="number"
                name="sqft"
                value={formData.sqft}
                onChange={handleChange}
                placeholder="800"
                className={inputStyles.standard}
                min="0"
                step="50"
              />
            </div>

            {/* Year Built and Renovation Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={inputStyles.label}>
                  Year Built <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="yearBuilt"
                  value={formData.yearBuilt}
                  onChange={handleChange}
                  placeholder="e.g., 2010"
                  className={inputStyles.standard}
                  required
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label className={inputStyles.label}>
                  Renovation Year (optional)
                </label>
                <input
                  type="number"
                  name="renovationYear"
                  value={formData.renovationYear}
                  onChange={handleChange}
                  placeholder="e.g., 2020"
                  className={inputStyles.standard}
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            {/* Available From */}
            <div>
              <label className={inputStyles.label}>
                Available From
              </label>
              <input
                type="date"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleChange}
                className={inputStyles.standard}
              />
            </div>

            {/* Description */}
            <div>
              <label className={inputStyles.label}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your property..."
                className={inputStyles.standard}
                rows={4}
              />
            </div>

            {/* Amenities */}
            <div>
              <label className={inputStyles.label}>
                Amenities
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Select all amenities that apply to this listing
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amenities.washerDryerInUnit}
                    onChange={() => handleAmenityToggle('washerDryerInUnit')}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">In-unit Washer/Dryer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amenities.washerDryerInBuilding}
                    onChange={() => handleAmenityToggle('washerDryerInBuilding')}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Building Laundry</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amenities.dishwasher}
                    onChange={() => handleAmenityToggle('dishwasher')}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Dishwasher</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amenities.ac}
                    onChange={() => handleAmenityToggle('ac')}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Air Conditioning</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amenities.pets}
                    onChange={() => handleAmenityToggle('pets')}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Pet-Friendly</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amenities.fireplace}
                    onChange={() => handleAmenityToggle('fireplace')}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Fireplace</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amenities.gym}
                    onChange={() => handleAmenityToggle('gym')}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Gym</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amenities.parking}
                    onChange={() => handleAmenityToggle('parking')}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Parking</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amenities.pool}
                    onChange={() => handleAmenityToggle('pool')}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Pool</span>
                </label>
              </div>
            </div>

            {/* Outdoor Area and View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={inputStyles.label}>
                  Outdoor Area
                </label>
                <select
                  name="outdoorArea"
                  value={formData.outdoorArea}
                  onChange={handleChange}
                  className={inputStyles.standard}
                >
                  <option value="None">None</option>
                  <option value="Balcony">Balcony</option>
                  <option value="Patio">Patio</option>
                  <option value="Garden">Garden</option>
                  <option value="Terrace">Terrace</option>
                  <option value="Rooftop">Rooftop</option>
                </select>
              </div>
              <div>
                <label className={inputStyles.label}>
                  View
                </label>
                <select
                  name="view"
                  value={formData.view}
                  onChange={handleChange}
                  className={inputStyles.standard}
                >
                  <option value="None">None</option>
                  <option value="City">City</option>
                  <option value="Park">Park</option>
                  <option value="Water">Water</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Promotions */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <label className={inputStyles.label}>Promotions</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Offer discounts for specific lease terms to attract more renters
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPromotion}
                  className="text-sm px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors whitespace-nowrap"
                >
                  + Add Promotion
                </button>
              </div>
              {promotions.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No promotions — add one above</p>
              ) : (
                <div className="space-y-2">
                  {promotions.map((promo, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex-wrap">
                      <select
                        value={promo.leaseTermMonths}
                        onChange={(e) => updatePromotion(index, 'leaseTermMonths', parseInt(e.target.value))}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {[6, 9, 12, 15, 18].map(m => <option key={m} value={m}>{m} months</option>)}
                      </select>
                      <select
                        value={promo.type}
                        onChange={(e) => updatePromotion(index, 'type', e.target.value as Promotion['type'])}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="months_free">Months free</option>
                        <option value="reduced_rate">% discount</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={promo.value}
                          onChange={(e) => updatePromotion(index, 'value', parseFloat(e.target.value) || 0)}
                          placeholder={promo.type === 'months_free' ? '# months' : '% off'}
                          min={0}
                          max={promo.type === 'months_free' ? promo.leaseTermMonths - 1 : 99}
                          step={1}
                          className="w-20 text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <span className="text-xs text-gray-500">{promo.type === 'months_free' ? 'mo' : '%'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePromotion(index)}
                        className="ml-auto p-1.5 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact & Apply */}
            <div className="space-y-4">
              <div>
                <label className={inputStyles.label}>
                  Application URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="applyUrl"
                  value={formData.applyUrl}
                  onChange={handleChange}
                  placeholder="https://apply.example.com/listing/123"
                  className={inputStyles.standard}
                  required
                />
                <p className={textStyles.helperWithMargin}>Link where renters can submit their application</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={inputStyles.label}>Contact Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="(212) 555-0100"
                    className={inputStyles.standard}
                  />
                </div>
                <div>
                  <label className={inputStyles.label}>Contact Email <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="leasing@example.com"
                    className={inputStyles.standard}
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className={inputStyles.label}>
                Image URLs (one per line) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="images"
                value={formData.images}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-example1?w=800"
                className={inputStyles.standard}
                rows={4}
                required
              />
              <p className={textStyles.helperWithMargin}>
                Add one image URL per line. You can use Unsplash URLs or any other image hosting service.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className={textStyles.error}>
                {error}
              </div>
            )}

            {/* Warning Message */}
            {warning && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-xl">⚠️</span>
                  <p className="text-sm">{warning}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${buttonStyles.primary} flex-1`}
              >
                {isSubmitting ? "Updating Listing..." : "Update Listing"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/manager/dashboard")}
                className={buttonStyles.secondary}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    }>
      <EditListingContent />
    </Suspense>
  );
}
