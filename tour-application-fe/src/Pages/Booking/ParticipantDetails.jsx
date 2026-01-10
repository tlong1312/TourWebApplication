import { FiCalendar } from "react-icons/fi";

export default function ParticipantDetails({ participants, onChange }) {
  const updateParticipant = (index, field, value) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <FiCalendar className="text-primary" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Thông tin hành khách</h2>
          <p className="text-sm text-gray-600">Vui lòng nhập đầy đủ thông tin cho tất cả hành khách</p>
        </div>
      </div>

      {participants.map((participant, index) => (
        <div key={participant.id} className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
              {index + 1}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">
                {participant.participantType === 'ADULT' ? 'Người lớn' : participant.participantType === 'CHILD' ? 'Trẻ em' : 'Em bé'}
              </h3>
              {index === 0 && <p className="text-xs text-blue-600">Người liên hệ</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={participant.fullName}
                onChange={(e) => updateParticipant(index, 'fullName', e.target.value)}
                placeholder="Nhập họ và tên"
                disabled={index === 0}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={participant.dateOfBirth}
                onChange={(e) => updateParticipant(index, 'dateOfBirth', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <select
                value={participant.gender}
                onChange={(e) => updateParticipant(index, 'gender', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loại phòng <span className="text-red-500">*</span>
              </label>
              <select
                value={participant.roomType}
                onChange={(e) => updateParticipant(index, 'roomType', e.target.value)}
                disabled={participant.participantType !== 'ADULT'}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-100"
              >
                <option value="DOUBLE">Phòng đôi</option>
                <option value="SINGLE">Phòng đơn</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}