import { FiUsers, FiAlertCircle } from "react-icons/fi";

export default function PassengerInfo({ data, onChange, tour, schedule }) {
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const PassengerCounter = ({ title, subtitle, price, count, onIncrease, onDecrease, min = 0, max }) => (
    <div className="p-4 border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
          <p className="text-sm font-semibold text-primary">{formatCurrency(price)}/người</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onDecrease}
            disabled={count <= min}
            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            -
          </button>
          <span className="w-12 text-center font-bold text-lg">{count}</span>
          <button
            onClick={onIncrease}
            disabled={max !== undefined && count >= max}
            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <FiUsers className="text-primary" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Chọn số lượng khách</h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <FiAlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Chỗ còn trống: {schedule.availableSeats} chỗ</p>
          <p>Vui lòng chọn số lượng khách không vượt quá số chỗ còn trống</p>
        </div>
      </div>

      <PassengerCounter
        title="Người lớn"
        subtitle="Từ 12 tuổi trở lên"
        price={tour.adultPrice}
        count={data.numAdults}
        min={1}
        onIncrease={() => onChange({ ...data, numAdults: data.numAdults + 1 })}
        onDecrease={() => onChange({ ...data, numAdults: Math.max(1, data.numAdults - 1) })}
      />

      <PassengerCounter
        title="Trẻ em"
        subtitle="Từ 2-11 tuổi"
        price={tour.childPrice}
        count={data.numChildren}
        onIncrease={() => onChange({ ...data, numChildren: data.numChildren + 1 })}
        onDecrease={() => onChange({ ...data, numChildren: Math.max(0, data.numChildren - 1) })}
      />

      <PassengerCounter
        title="Em bé"
        subtitle="Dưới 2 tuổi"
        price={tour.infantPrice}
        count={data.numInfants}
        onIncrease={() => onChange({ ...data, numInfants: data.numInfants + 1 })}
        onDecrease={() => onChange({ ...data, numInfants: Math.max(0, data.numInfants - 1) })}
      />

      <PassengerCounter
        title="Phòng đơn"
        subtitle="Phụ thu phòng đơn (chỉ áp dụng cho người lớn)"
        price={tour.singleRoomSurcharge}
        count={data.numSingleRooms}
        max={data.numAdults}
        onIncrease={() => onChange({ ...data, numSingleRooms: Math.min(data.numAdults, data.numSingleRooms + 1) })}
        onDecrease={() => onChange({ ...data, numSingleRooms: Math.max(0, data.numSingleRooms - 1) })}
      />
    </div>
  );
}