import { useState } from 'react';
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FiCalendar, FiClock, FiUsers } from "react-icons/fi";

export default function Schedule({ tour }) {
  const Schedules = tour?.schedules || [];
  const [selectedDate, setSelectedDate] = useState(
    tour?.schedules[0]?.departureDate ? new Date(tour.schedules[0].departureDate) : null
  );
  const availableDates = Schedules.map(schedule => {
    const date = new Date(schedule.departureDate);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  });
  const selectedSchedule = Schedules.find(schedule => {
    const scheduleDate = new Date(schedule.departureDate);
    const normalizedScheduleDate = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate());
    const normalizedSelectedDate = selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) : null;
    return normalizedScheduleDate.getTime() === normalizedSelectedDate?.getTime();
  });

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiCalendar className="text-primary" />
          Chọn ngày khởi hành
        </h3>
        
        <style>{`
          .react-calendar {
            width: 100%;
            border: none;
            background: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .react-calendar__tile {
            padding: 12px 8px;
            border-radius: 8px;
            transition: all 0.2s;
          }
          .react-calendar__tile:enabled:hover {
            background: #f0f7ff;
            color: #003580;
          }
          .react-calendar__tile--active {
            background: #003580 !important;
            color: white !important;
          }
          .react-calendar__tile:disabled {
            background: transparent;
            color: #d1d5db;
            cursor: not-allowed;
          }
          .react-calendar__navigation button {
            font-size: 16px;
            font-weight: 600;
            color: #003580;
          }
          .react-calendar__month-view__days__day--weekend {
            color: #ef4444;
          }
        `}</style>

        <Calendar
          value={selectedDate}
          onChange={setSelectedDate}
          tileDisabled={({ date, view }) => {
            if (view === 'month') {
              const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
              return !availableDates.some(availableDate => 
                availableDate.getTime() === normalizedDate.getTime()
              );
            }
            return false;
          }}
        />
      </div>

      {/* Selected Schedule Info */}
      {selectedSchedule && (
        <div className="bg-blue-50 border-2 border-primary rounded-xl p-6">
          <h4 className="font-bold text-gray-900 mb-4 text-lg">
            Thông tin lịch trình đã chọn
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <FiCalendar className="text-primary flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-gray-500">Ngày khởi hành</p>
                <p className="font-semibold">
                  {new Date(selectedSchedule.departureDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <FiClock className="text-primary flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-gray-500">Giờ khởi hành</p>
                <p className="font-semibold">
                  {selectedSchedule.departureTime || "Chưa cập nhật"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <FiUsers className="text-primary flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-gray-500">Số chỗ còn trống</p>
                <p className="font-semibold text-green-600">
                  {selectedSchedule.availableSeats} chỗ
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Schedules List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-bold text-gray-900 mb-4">
          Tất cả ngày khởi hành ({Schedules.length})
        </h4>
        
        <div className="space-y-3">
          {Schedules.map((schedule) => (
            <button
              key={schedule.id}
              onClick={() => setSelectedDate(new Date(schedule.departureDate))}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedSchedule?.id === schedule.id
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-200 hover:border-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    📅 {new Date(schedule.departureDate).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    ⏰ {schedule.departureTime || "Chưa cập nhật"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Còn trống</p>
                  <p className="font-bold text-primary">{schedule.availableSeats} chỗ</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}