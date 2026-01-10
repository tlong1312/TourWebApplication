import React from 'react';
import { FiMapPin, FiCoffee, FiHome, FiCheckCircle } from 'react-icons/fi';

export default function Itinerary({ tour }) {
  const Itineraries = tour?.itineraries || [];

  return (
    <div className="space-y-6">
      {Itineraries.map((itinerary, index) => (
        <div key={itinerary.id} className="relative">
          {/* Timeline Line */}
          {index < Itineraries.length - 1 && (
            <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200"></div>
          )}

          <div className="flex gap-4">
            {/* Day Number Badge */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-md z-10 relative">
                {itinerary.dayNumber}
              </div>
            </div>

            {/* Content Card */}
            <div className="flex-1 bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:border-primary transition-all duration-300">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary-light p-4">
                <h3 className="text-xl font-bold text-white">
                  {itinerary.title}
                </h3>
                <p className="text-white/90 text-sm mt-1">Ngày {itinerary.dayNumber}</p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Description */}
                <div className="text-gray-700 leading-relaxed">
                  {itinerary.description}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  {/* Activities */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FiMapPin className="text-primary" size={20} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Hoạt động
                      </p>
                      <p className="text-sm text-gray-900 font-medium">
                        {itinerary.activities || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>

                  {/* Meals */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                        <FiCoffee className="text-amber-600" size={20} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Bữa ăn
                      </p>
                      <p className="text-sm text-gray-900 font-medium">
                        {itinerary.meals || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>

                  {/* Accommodation */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <FiHome className="text-green-600" size={20} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Nghỉ đêm
                      </p>
                      <p className="text-sm text-gray-900 font-medium">
                        {itinerary.accommodation || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* End of Journey */}
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-md">
            <FiCheckCircle size={24} />
          </div>
        </div>
        <div className="flex-1 flex items-center">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl px-6 py-4 flex-1">
            <p className="text-green-800 font-semibold">
              Kết thúc hành trình
            </p>
            <p className="text-green-600 text-sm mt-1">
              Hẹn gặp lại bạn trong chuyến đi tiếp theo!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}