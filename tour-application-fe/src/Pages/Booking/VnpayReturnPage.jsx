import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiHome, FiPackage, FiCreditCard } from "react-icons/fi";

export default function VnpayReturnPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [txnRef, setTxnRef] = useState("");

  useEffect(() => {
    const code = queryParams.get("vnp_ResponseCode");
    const orderInfo = queryParams.get("vnp_OrderInfo");
    const txnRefParam = queryParams.get("vnp_TxnRef");
    const amountParam = queryParams.get("vnp_Amount");
    const bankCode = queryParams.get("vnp_BankCode");

    const formattedAmount = amountParam
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amountParam) / 100)
      : "";

    setAmount(formattedAmount);
    setBank(bankCode || "");
    setTxnRef(txnRefParam || "");

    if (!code) {
      setStatus("fail");
      setMessage("Không nhận được thông tin thanh toán");
      return;
    }

    if (code === "00") {
      setStatus("success");
      setMessage("Thanh toán thành công! Cảm ơn bạn đã đặt tour");
    } else if (code === "24") {
      setStatus("canceled");
      setMessage("Bạn đã hủy giao dịch thanh toán");
    } else {
      setStatus("fail");
      setMessage(`Thanh toán thất bại (Mã lỗi: ${code})`);
    }
  }, [location.search]);

  const getStatusConfig = () => {
    if (status === "success") {
      return {
        icon: FiCheckCircle,
        iconColor: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        titleColor: "text-green-900",
        title: "Thanh toán thành công!",
        gradient: "from-green-500 to-emerald-600"
      };
    }
    if (status === "canceled") {
      return {
        icon: FiAlertCircle,
        iconColor: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        titleColor: "text-yellow-900",
        title: "Đã hủy thanh toán",
        gradient: "from-yellow-500 to-orange-600"
      };
    }
    return {
      icon: FiXCircle,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      titleColor: "text-red-900",
      title: "Thanh toán thất bại",
      gradient: "from-red-500 to-rose-600"
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className={`bg-gradient-to-r ${config.gradient} p-8 text-center`}>
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icon className={config.iconColor} size={48} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{config.title}</h1>
            <p className="text-white/90 text-lg">{message}</p>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Transaction Details */}
            {status && (
              <div className="space-y-4 mb-8">
                {txnRef && (
                  <div className={`flex items-center justify-between p-4 ${config.bgColor} border ${config.borderColor} rounded-xl`}>
                    <div className="flex items-center gap-3">
                      <FiPackage className={config.iconColor} size={24} />
                      <div>
                        <p className="text-sm text-gray-600">Mã giao dịch</p>
                        <p className={`font-bold ${config.titleColor}`}>{txnRef}</p>
                      </div>
                    </div>
                  </div>
                )}

                {amount && (
                  <div className={`flex items-center justify-between p-4 ${config.bgColor} border ${config.borderColor} rounded-xl`}>
                    <div className="flex items-center gap-3">
                      <FiCreditCard className={config.iconColor} size={24} />
                      <div>
                        <p className="text-sm text-gray-600">Số tiền</p>
                        <p className={`text-2xl font-bold ${config.titleColor}`}>{amount}</p>
                      </div>
                    </div>
                  </div>
                )}

                {bank && (
                  <div className={`flex items-center justify-between p-4 ${config.bgColor} border ${config.borderColor} rounded-xl`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow">
                        <span className="text-xs font-bold text-gray-600">BANK</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ngân hàng</p>
                        <p className={`font-bold ${config.titleColor}`}>{bank.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Success Info */}
            {status === "success" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  ✓ Thông tin đặt tour đã được gửi về email của bạn<br/>
                  ✓ Bạn có thể xem chi tiết trong lịch sử đặt tour
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {status === "success" ? (
                <>
                  <Link
                    to="/booking-history"
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-6 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl"
                  >
                    <FiPackage size={20} />
                    Xem lịch sử đặt tour
                  </Link>
                  <Link
                    to="/"
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    <FiHome size={20} />
                    Trang chủ
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-6 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl"
                  >
                    Thử lại
                  </button>
                  <Link
                    to="/"
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    <FiHome size={20} />
                    Trang chủ
                  </Link>
                </>
              )}
            </div>

            {/* Support Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Cần hỗ trợ? Liên hệ: <a href="tel:1900xxxx" className="text-primary hover:underline font-semibold">1900 xxxx</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}