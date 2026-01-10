import { FiX, FiCheck } from "react-icons/fi";

export default function TermsOfService({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-light p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Điều Khoản Dịch Vụ</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          <div className="space-y-4 text-gray-700">
            <section>
              <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <FiCheck className="text-primary" />
                1. Chấp Nhận Điều Khoản
              </h3>
              <p className="text-sm leading-relaxed">
                Bằng việc truy cập và sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <FiCheck className="text-primary" />
                2. Sử Dụng Dịch Vụ
              </h3>
              <ul className="text-sm space-y-2 list-disc list-inside">
                <li>Thông tin đăng ký phải chính xác và trung thực</li>
                <li>Bảo mật thông tin tài khoản của bạn</li>
                <li>Không sử dụng dịch vụ cho mục đích bất hợp pháp</li>
                <li>Tuân thủ các quy định về thanh toán và hủy tour</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <FiCheck className="text-primary" />
                3. Đặt Tour & Thanh Toán
              </h3>
              <p className="text-sm leading-relaxed">
                Khi đặt tour, bạn cam kết thanh toán đầy đủ theo giá niêm yết. Chúng tôi chấp nhận các phương thức thanh toán qua VNPay và các hình thức khác được công bố trên website.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <FiCheck className="text-primary" />
                4. Chính Sách Hủy & Hoàn Tiền
              </h3>
              <ul className="text-sm space-y-2 list-disc list-inside">
                <li>Hủy trước 7 ngày: Hoàn 80% giá trị</li>
                <li>Hủy trước 3-7 ngày: Hoàn 50% giá trị</li>
                <li>Hủy trong vòng 3 ngày: Không hoàn tiền</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <FiCheck className="text-primary" />
                5. Bảo Mật Thông Tin
              </h3>
              <p className="text-sm leading-relaxed">
                Chúng tôi cam kết bảo mật thông tin cá nhân của bạn và chỉ sử dụng cho mục đích cung cấp dịch vụ. Vui lòng xem chi tiết tại Chính sách bảo mật.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <FiCheck className="text-primary" />
                6. Thay Đổi Điều Khoản
              </h3>
              <p className="text-sm leading-relaxed">
                Chúng tôi có quyền cập nhật điều khoản dịch vụ bất kỳ lúc nào. Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-primary to-primary-light text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
}