import { FiPackage, FiCalendar, FiClock } from "react-icons/fi";

export default function TourSummary({ tour, schedule, passengers }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const calculateTotal = () => {
    const adultPrice = Number(tour.adultPrice) || 0;
    const childPrice = Number(tour.childPrice) || 0;
    const infantPrice = Number(tour.infantPrice) || 0;
    const singleRoomSurcharge = Number(tour.singleRoomSurcharge) || 0;

    return (
      passengers.numAdults * adultPrice +
      passengers.numChildren * childPrice +
      passengers.numInfants * infantPrice +
      passengers.numSingleRooms * singleRoomSurcharge
    );
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-28">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
            <FiPackage className="text-orange-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Tóm tắt đặt tour</h3>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">{tour.name}</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="flex items-center gap-2">
                <FiCalendar size={16} />
                {schedule.departureDate ? new Date(schedule.departureDate).toLocaleDateString('vi-VN') : 'Chưa chọn'}
              </p>
              <p className="flex items-center gap-2">
                <FiClock size={16} />
                {schedule.duration || `${tour.duration} ngày`}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Chi tiết giá</h4>
            <div className="space-y-2 text-sm">
              {passengers.numAdults > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Người lớn × {passengers.numAdults}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(tour.adultPrice * passengers.numAdults)}
                  </span>
                </div>
              )}
              
              {passengers.numChildren > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Trẻ em × {passengers.numChildren}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(tour.childPrice * passengers.numChildren)}
                  </span>
                </div>
              )}
              
              {passengers.numInfants > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Em bé × {passengers.numInfants}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(tour.infantPrice * passengers.numInfants)}
                  </span>
                </div>
              )}
              
              {passengers.numSingleRooms > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Phòng đơn × {passengers.numSingleRooms}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(tour.singleRoomSurcharge * passengers.numSingleRooms)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t-2 border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}