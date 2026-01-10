import { FiCreditCard, FiAlertCircle } from "react-icons/fi";

export default function PaymentMethod({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <FiCreditCard className="text-primary" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Thanh toán & Ghi chú</h2>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Phương thức thanh toán
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border-2 border-primary bg-primary/5 rounded-xl cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="vnpay"
              checked={data.paymentMethod === 'vnpay'}
              onChange={(e) => onChange({ ...data, paymentMethod: e.target.value })}
              className="w-5 h-5"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">VNPay</p>
              <p className="text-sm text-gray-600">Thanh toán qua cổng VNPay (ATM, Visa, MasterCard)</p>
            </div>
            <img src="/vnpay-logo.png" alt="VNPay" className="h-8" onError={(e) => e.target.style.display = 'none'} />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ghi chú (không bắt buộc)
        </label>
        <textarea
          value={data.customerNotes}
          onChange={(e) => onChange({ ...data, customerNotes: e.target.value })}
          placeholder="Ví dụ: Muốn phòng view biển, không ăn hải sản..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <FiAlertCircle size={18} />
          Điều khoản và điều kiện
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 ml-6">
          <li>• Vui lòng kiểm tra kỹ thông tin trước khi thanh toán</li>
          <li>• Sau khi thanh toán thành công, thông tin booking sẽ được gửi qua email</li>
          <li>• Mọi thắc mắc vui lòng liên hệ hotline để được hỗ trợ</li>
        </ul>
      </div>
    </div>
  );
}