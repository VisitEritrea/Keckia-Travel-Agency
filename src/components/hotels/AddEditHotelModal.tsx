import React, { useState } from 'react';
import {
  X,
  Building,
  MapPin,
  Phone,
  Mail,
  Star,
  Image,
  Plus,
  Trash2,
  BedDouble,
  DollarSign,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Hotel, HotelRoomType } from '../../types';
import { ImageUploadField } from '../ui/Kit';

interface AddEditHotelModalProps {
  hotelToEdit?: Hotel | null;
  onClose: () => void;
  onSaveHotel: (hotel: Hotel) => void;
}

export const AddEditHotelModal: React.FC<AddEditHotelModalProps> = ({
  hotelToEdit,
  onClose,
  onSaveHotel,
}) => {
  const isEditing = !!hotelToEdit;

  const [name, setName] = useState(hotelToEdit?.name || '');
  const [nameTigrinya, setNameTigrinya] = useState(hotelToEdit?.nameTigrinya || '');
  const [city, setCity] = useState(hotelToEdit?.city || 'Asmara');
  const [region, setRegion] = useState(hotelToEdit?.region || 'Central (Maekel)');
  const [starRating, setStarRating] = useState<number>(hotelToEdit?.starRating || 4);
  const [address, setAddress] = useState(hotelToEdit?.address || '');
  const [phone, setPhone] = useState(hotelToEdit?.phone || '+291 1 ');
  const [email, setEmail] = useState(hotelToEdit?.email || '');
  const [image, setImage] = useState(hotelToEdit?.image || '');
  const [description, setDescription] = useState(hotelToEdit?.description || '');
  const [amenitiesInput, setAmenitiesInput] = useState(
    hotelToEdit?.amenities.join(', ') ||
      'High-Speed Wi-Fi, 24/7 Power Backup, Restaurant & Bar, Airport Shuttle, Air Conditioning'
  );

  const [roomTypes, setRoomTypes] = useState<HotelRoomType[]>(
    hotelToEdit?.roomTypes || [
      {
        id: `rm-${Date.now()}-1`,
        name: 'Executive Deluxe Suite',
        pricePerNightUSD: 140,
        pricePerNightNFA: 2100,
        capacity: 2,
        totalRooms: 20,
        availableRooms: 8,
        bedType: '1 King Bed',
        features: ['City View Balcony', 'En-suite Marble Bath', 'Work Desk', 'Mini Fridge'],
      },
      {
        id: `rm-${Date.now()}-2`,
        name: 'Standard Heritage Twin',
        pricePerNightUSD: 95,
        pricePerNightNFA: 1425,
        capacity: 2,
        totalRooms: 30,
        availableRooms: 12,
        bedType: '2 Twin Beds',
        features: ['Air Conditioning', 'Satellite TV', 'Luggage Rack'],
      },
    ]
  );

  // New room state
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPriceUSD, setNewRoomPriceUSD] = useState<number>(110);
  const [newRoomCapacity, setNewRoomCapacity] = useState<number>(2);
  const [newRoomBed, setNewRoomBed] = useState('1 Queen Bed');
  const [newRoomTotal, setNewRoomTotal] = useState<number>(15);

  const citiesList = [
    { city: 'Asmara', region: 'Central (Maekel)', tigrinyaPrefix: 'ኣስመራ' },
    { city: 'Massawa', region: 'Northern Red Sea', tigrinyaPrefix: 'ባጽዕ' },
    { city: 'Keren', region: 'Anseba', tigrinyaPrefix: 'ከረን' },
    { city: 'Senafe (Qohaito Plateau)', region: 'Southern (Debub)', tigrinyaPrefix: 'ሰንዓፈ' },
    { city: 'Dissei Island', region: 'Northern Red Sea (Dahlak Archipelago)', tigrinyaPrefix: 'ደሴት ዳህላክ' },
    { city: 'Assab', region: 'Southern Red Sea', tigrinyaPrefix: 'ዓሰብ' },
    { city: 'Barentu', region: 'Gash-Barka', tigrinyaPrefix: 'ባረንቱ' },
    { city: 'Mendefera', region: 'Southern (Debub)', tigrinyaPrefix: 'መንደፈራ' },
  ];

  const handleCityChange = (cityName: string) => {
    setCity(cityName);
    const found = citiesList.find((c) => c.city === cityName);
    if (found) {
      setRegion(found.region);
      if (!nameTigrinya) {
        setNameTigrinya(`ሆቴል ${name || found.tigrinyaPrefix}`);
      }
    }
  };

  const handleAddRoom = () => {
    if (!newRoomName.trim()) return;
    const newRoom: HotelRoomType = {
      id: `rm-${Date.now()}`,
      name: newRoomName.trim(),
      pricePerNightUSD: Number(newRoomPriceUSD) || 100,
      pricePerNightNFA: (Number(newRoomPriceUSD) || 100) * 15,
      capacity: Number(newRoomCapacity) || 2,
      totalRooms: Number(newRoomTotal) || 10,
      availableRooms: Number(newRoomTotal) || 10,
      bedType: newRoomBed,
      features: ['Air Conditioning', 'En-suite Bathroom', 'Room Service'],
    };
    setRoomTypes((prev) => [...prev, newRoom]);
    setNewRoomName('');
    setNewRoomPriceUSD(110);
  };

  const handleDeleteRoom = (roomId: string) => {
    setRoomTypes((prev) => prev.filter((r) => r.id !== roomId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const amenities = amenitiesInput
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const updatedHotel: Hotel = {
      id: hotelToEdit?.id || `htl-${Date.now()}`,
      name: name.trim(),
      nameTigrinya: nameTigrinya.trim() || `ሆቴል ${name.trim()}`,
      city,
      region,
      starRating,
      address: address.trim() || `${city}, Eritrea`,
      phone: phone.trim(),
      email: email.trim() || `info@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.er`,
      image: image.trim(),
      description:
        description.trim() ||
        `Hospitality and accommodation partner located in ${city}, providing quality lodging for tour groups, international visitors, and expeditions.`,
      amenities: amenities.length > 0 ? amenities : ['High-Speed Wi-Fi', '24/7 Power Backup', 'Restaurant'],
      roomTypes: roomTypes.length > 0 ? roomTypes : [
        {
          id: `rm-def-1`,
          name: 'Standard Heritage Room',
          pricePerNightUSD: 90,
          pricePerNightNFA: 1350,
          capacity: 2,
          totalRooms: 20,
          availableRooms: 10,
          bedType: '1 Double Bed',
          features: ['Air Conditioning', 'En-suite Bathroom'],
        },
      ],
    };

    onSaveHotel(updatedHotel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900 italic">
                {isEditing ? 'Edit Partner Hotel Profile' : 'Add New Eritrean Partner Hotel'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Configure hotel location, contact details, Tigrinya branding, and room category inventory.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building className="w-3.5 h-3.5" /> Property Details & Tigrinya Branding
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hotel Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hotel Asmara Palace, Albergo Italia"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hotel Name in Tigrinya (ስም ሆቴል ብትግርኛ) *
                </label>
                <input
                  type="text"
                  required
                  value={nameTigrinya}
                  onChange={(e) => setNameTigrinya(e.target.value)}
                  placeholder="e.g. ሆቴል ኣስመራ ፓላስ, ሆቴል ግራንድ ዳህላክ"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City / Location *</label>
                <select
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                >
                  {citiesList.map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city} ({c.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Star Rating (1 - 5)</label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setStarRating(star)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        starRating >= star
                          ? 'bg-amber-50 border-amber-300 text-amber-500'
                          : 'bg-slate-50 border-slate-200 text-slate-300'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs text-slate-600 font-bold ml-2">
                    {starRating}-Star Standard
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Physical Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Gurey Street, Airport Road, Asmara, Eritrea"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Contact & Image */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> Front Office & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telephone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+291 1 153700"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reservation Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reservations@hotel.er"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <ImageUploadField
              label="Property Photo"
              value={image}
              onChange={setImage}
              hint="Uploaded from your device — resized automatically."
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe hotel heritage, amenities, proximity to landmarks..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amenities & Features (Comma separated)
              </label>
              <input
                type="text"
                value={amenitiesInput}
                onChange={(e) => setAmenitiesInput(e.target.value)}
                placeholder="Free Wi-Fi, Swimming Pool, Italian Restaurant, 24/7 Power, Mountain View"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Room Categories */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-purple-800 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BedDouble className="w-3.5 h-3.5" /> Room Categories & Pricing ({roomTypes.length})
              </span>
            </h3>

            {/* List of existing rooms */}
            <div className="space-y-2">
              {roomTypes.map((room) => (
                <div
                  key={room.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{room.name}</span>
                    <span className="text-slate-500 ml-2">
                      ({room.bedType} · Max {room.capacity} Guests · {room.totalRooms} Rooms)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-emerald-800">
                      ${room.pricePerNightUSD}/night ({room.pricePerNightNFA} NFA)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(room.id)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                      title="Remove room type"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick add new room type */}
            <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3">
              <span className="text-xs font-bold text-purple-900 block">Add New Room Category</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Room Name (e.g. Balcony Suite)"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-xs"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={newRoomPriceUSD}
                    onChange={(e) => setNewRoomPriceUSD(Number(e.target.value))}
                    placeholder="USD / Night"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleAddRoom}
                    className="w-full py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Category
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isEditing ? 'Save Hotel Changes' : 'Create Hotel Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
