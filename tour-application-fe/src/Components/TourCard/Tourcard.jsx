import { Link } from "react-router-dom";
import { FiClock, FiStar, FiMapPin, FiArrowRight } from "react-icons/fi";

export default function TourCard({ tour, imagesMap }) {
  const imageUrl = (imagesMap && tour?.id && imagesMap[tour.id]) || "/placeholder.svg";
  const price = Number(tour.price || 0);
  const rating = tour.rating || 4.8;
  const location = tour.categoryName || tour.destination || "Việt Nam";

  return (
    <Link 
      to={`/tours/${tour.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image Section - 4:3 Aspect Ratio */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
        <img
          src={imageUrl}
          alt={tour.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Location Badge - Top Left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
          <FiMapPin className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-gray-900">{location}</span>
        </div>

        {/* Duration Badge - Top Right */}
        <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
          {tour.duration}N{tour.duration - 1}Đ
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title - 2 Lines Max */}
        <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-3 min-h-[56px] group-hover:text-primary transition-colors">
          {tour.name}
        </h3>

        {/* Meta Info Row */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          {/* Duration */}
          <div className="flex items-center gap-1.5">
            <FiClock className="w-4 h-4" />
            <span>{tour.duration} ngày</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-900">{rating}</span>
            <span>({tour.reviews || 0})</span>
          </div>
        </div>

        {/* Footer - Price & CTA */}
        <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
          {/* Price */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Từ</p>
            <p className="text-2xl font-bold text-amber-600">
              {price.toLocaleString("vi-VN")}
              <span className="text-base font-normal text-gray-600">đ</span>
            </p>
          </div>

          {/* CTA Arrow */}
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full group-hover:bg-primary transition-colors">
            <FiArrowRight className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}