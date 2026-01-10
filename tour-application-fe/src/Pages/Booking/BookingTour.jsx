import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import api from "../../utils/api/api";
import ProgressSteps from "./ProgressSteps";
import ContactForm from "./ContactForm";
import PassengerInfo from "./PassengerInfo";
import ParticipantDetails from "./ParticipantDetails";
import PaymentMethod from "./PaymentMethod";
import TourSummary from "./TourSummary";

export default function BookingTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const tourData = location.state?.tour || {};
  const schedule = tourData.schedules?.[0] || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contactInfo, setContactInfo] = useState({ fullName: "", email: "", phone: "", address: "" });
  const [passengerCounts, setPassengerCounts] = useState({ numAdults: 1, numChildren: 0, numInfants: 0, numSingleRooms: 0 });
  const [participants, setParticipants] = useState([{ id: 1, fullName: "", dateOfBirth: "", gender: "MALE", participantType: "ADULT", roomType: "DOUBLE" }]);
  const [bookingDetails, setBookingDetails] = useState({ customerNotes: "", paymentMethod: "vnpay" });

  // Auto-generate participants
  useEffect(() => {
    const total = passengerCounts.numAdults + passengerCounts.numChildren + passengerCounts.numInfants;
    if (total === participants.length) return;

    const newParticipants = [];
    [
      { count: passengerCounts.numAdults, type: 'ADULT' },
      { count: passengerCounts.numChildren, type: 'CHILD' },
      { count: passengerCounts.numInfants, type: 'INFANT' }
    ].forEach(({ count, type }) => {
      for (let i = 0; i < count; i++) {
        newParticipants.push({
          id: Date.now() + newParticipants.length,
          fullName: type === 'ADULT' && i === 0 ? contactInfo.fullName : "",
          dateOfBirth: "", gender: "MALE", participantType: type,
          roomType: type === 'ADULT' && i < passengerCounts.numSingleRooms ? "SINGLE" : "DOUBLE"
        });
      }
    });
    setParticipants(newParticipants);
  }, [passengerCounts]);

  // Sync first participant
  useEffect(() => {
    if (participants[0] && contactInfo.fullName) {
      setParticipants(prev => {
        const updated = [...prev];
        updated[0].fullName = contactInfo.fullName;
        return updated;
      });
    }
  }, [contactInfo.fullName]);

  const validateStep = (step) => {
    setError(null);
    if (step === 1) {
      if (!contactInfo.fullName.trim()) return setError("Vui lòng nhập họ tên");
      if (!/^[\w.-]+@gmail\.com$/i.test(contactInfo.email)) return setError("Email phải là @gmail.com");
      if (contactInfo.phone.length < 10) return setError("Số điện thoại không hợp lệ");
      if (!contactInfo.address.trim()) return setError("Vui lòng nhập địa chỉ");
    }
    if (step === 2) {
      const total = passengerCounts.numAdults + passengerCounts.numChildren + passengerCounts.numInfants;
      if (total === 0) return setError("Vui lòng chọn số lượng khách");
      if (total > schedule.availableSeats) return setError(`Vượt quá ${schedule.availableSeats} chỗ trống`);
      if (passengerCounts.numSingleRooms > passengerCounts.numAdults) return setError("Phòng đơn không thể > người lớn");
    }
    if (step === 3) {
      for (let i = 0; i < participants.length; i++) {
        if (!participants[i].fullName.trim()) return setError(`Thiếu họ tên hành khách ${i + 1}`);
        if (!participants[i].dateOfBirth) return setError(`Thiếu ngày sinh hành khách ${i + 1}`);
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBooking = async () => {
    if (!validateStep(3)) return;
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/api/bookings", {
        tourId: tourData.id, tourScheduleId: schedule.id, ...passengerCounts,
        contactName: contactInfo.fullName, contactEmail: contactInfo.email,
        contactPhone: contactInfo.phone, contactAddress: contactInfo.address,
        customerNotes: bookingDetails.customerNotes,
        participants: participants.map(p => ({
          fullName: p.fullName, dateOfBirth: p.dateOfBirth,
          gender: p.gender, participantType: p.participantType, roomType: p.roomType
        }))
      });

      if (data.paymentUrl) window.location.href = data.paymentUrl;
      else navigate("/booking-history");
    } catch (err) {
      setError(err.response?.data?.message || "Đặt tour thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!tourData.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy tour</h2>
          <button onClick={() => navigate('/tours')} className="mt-4 bg-primary text-white px-6 py-3 rounded-xl">Quay về</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6">
          <FiArrowLeft size={20} /> Quay lại
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt tour du lịch</h1>
          <p className="text-gray-600">Vui lòng điền đầy đủ thông tin</p>
        </div>

        <ProgressSteps currentStep={currentStep} />

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <FiAlertCircle className="text-red-600 mt-0.5" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            {currentStep === 1 && <ContactForm data={contactInfo} onChange={setContactInfo} />}
            {currentStep === 2 && <PassengerInfo data={passengerCounts} onChange={setPassengerCounts} tour={tourData} schedule={schedule} />}
            {currentStep === 3 && <ParticipantDetails participants={participants} onChange={setParticipants} />}
            {currentStep === 4 && <PaymentMethod data={bookingDetails} onChange={setBookingDetails} />}

            <div className="flex gap-4 mt-8 pt-6 border-t">
              {currentStep > 1 && (
                <button onClick={() => setCurrentStep(currentStep - 1)} className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200">
                  <FiArrowLeft className="inline mr-2" size={18} /> Quay lại
                </button>
              )}
              {currentStep < 4 ? (
                <button onClick={handleNext} className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark">
                  Tiếp tục <FiArrowLeft className="inline ml-2 rotate-180" size={18} />
                </button>
              ) : (
                <button onClick={handleBooking} disabled={loading} className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50">
                  {loading ? "Đang xử lý..." : "Xác nhận & Thanh toán"}
                </button>
              )}
            </div>
          </div>

          <TourSummary tour={tourData} schedule={schedule} passengers={passengerCounts} />
        </div>
      </div>
    </div>
  );
}