import { FiUser, FiUsers, FiCalendar, FiCreditCard, FiCheck } from "react-icons/fi";

export default function ProgressSteps({ currentStep }) {
  const steps = [
    { num: 1, label: 'Thông tin liên hệ', icon: FiUser },
    { num: 2, label: 'Số lượng khách', icon: FiUsers },
    { num: 3, label: 'Hành khách', icon: FiCalendar },
    { num: 4, label: 'Thanh toán', icon: FiCreditCard }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;
          
          return (
            <div key={step.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all
                  ${isActive ? 'bg-primary text-white scale-110' : ''}
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}`}>
                  {isCompleted ? <FiCheck size={24} /> : <Icon size={24} />}
                </div>
                <p className={`text-xs mt-2 font-medium text-center ${isActive ? 'text-primary' : 'text-gray-600'}`}>
                  {step.label}
                </p>
              </div>
              {index < 3 && <div className={`h-1 flex-1 mx-2 transition-all ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}