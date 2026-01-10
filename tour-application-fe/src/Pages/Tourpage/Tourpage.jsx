import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTours, getCategories, searchTours, getTourImages } from '../../utils/api/TourApi';
import TourCard from '../../Components/TourCard/Tourcard';
import { FiSearch, FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Tourpage() {
    const [searchParamsURL] = useSearchParams();
    const navigate = useNavigate();
    
    const [imagesMap, setImagesMap] = useState({});
    const [tours, setTours] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [maxPrice, setMaxPrice] = useState(50000000);
    const [minRatingChecked, setMinRatingChecked] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [keyword, setKeyword] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 12;

    // Fetch images
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await getTourImages();
                const map = {};
                res.data.forEach(img => {
                    if (img.isPrimary) map[img.tourId] = img.imageUrl;
                });
                setImagesMap(map);
            } catch (err) {
                console.error('Error fetching images:', err);
            }
        };
        fetchImages();
    }, []);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (categories.length > 0) {
            const categoryNameFromURL = searchParamsURL.get('category');
            if (categoryNameFromURL) {
                const decodedName = decodeURIComponent(categoryNameFromURL);
                const category = categories.find(cat => cat.name === decodedName);
                if (category) {
                    setSelectedCategory(category.id.toString());
                } else {
                    setSelectedCategory("all");
                }
                setCurrentPage(0);
            } else {
                fetchTours();
            }
        }
    }, [searchParamsURL, categories]);

    useEffect(() => {
        if (categories.length === 0) return;
        
        if (selectedCategory !== "all" || keyword || maxPrice !== 50000000 || selectedDuration || minRatingChecked) {
            handleSearch();
        } else {
            fetchTours();
        }
    }, [selectedCategory, maxPrice, selectedDuration, minRatingChecked, currentPage]);

    const fetchCategories = async () => {
        try {
            const response = await getCategories();
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Không thể tải danh mục');
        }
    };

    const fetchTours = async () => {
        setLoading(true);
        try {
            const response = await getTours({ page: currentPage, size: pageSize });
            if (response.data.content) {
                setTours(response.data.content);
                setTotalPages(response.data.totalPages);
                setTotalElements(response.data.totalElements);
            } else {
                setTours(response.data);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching tours:', err);
            setError('Không thể tải tour');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSearch = async (searchKeyword = keyword) => {
        setLoading(true);
        setKeyword(searchKeyword);
        
        try {
            const params = {
                keyword: searchKeyword || undefined,
                categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
                maxPrice: maxPrice !== 50000000 ? maxPrice : undefined,
                maxDuration: selectedDuration || undefined,
                minRating: minRatingChecked ? 4 : undefined,
                page: currentPage,
                size: pageSize,
                sortBy: "id",
                sortDir: "desc"
            };
            
            const cleanedParams = Object.fromEntries(
                Object.entries(params).filter(([_, v]) => v !== undefined)
            );
            
            const response = await searchTours(cleanedParams);
            
            if (response.data.content) {
                setTours(response.data.content);
                setTotalPages(response.data.totalPages);
                setTotalElements(response.data.totalElements);
            } else {
                setTours(response.data);
            }
            setError(null);
        } catch (err) {
            console.error('Error searching tours:', err);
            setError('Không thể tìm kiếm tour');
            setTours([]);
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilters = () => {
        setSelectedCategory("all");
        setMaxPrice(50000000);
        setMinRatingChecked(false);
        setSelectedDuration(null);
        setKeyword("");
        setCurrentPage(0);
        navigate('/tours');
        fetchTours();
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải danh sách tour...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Search */}
            <div className="bg-white border-b sticky top-20 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center mb-6">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Khám Phá Các Tour Du Lịch
                        </h1>
                        <p className="text-gray-600">
                            {totalElements > 0 
                                ? `Tìm thấy ${totalElements} tour phù hợp` 
                                : 'Chọn bộ lọc để tìm tour phù hợp'}
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="flex gap-3 max-w-3xl mx-auto">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm tour, địa điểm..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                        </div>
                        <button
                            onClick={() => handleSearch()}
                            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-semibold transition-colors"
                        >
                            Tìm kiếm
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-colors"
                        >
                            <FiFilter size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <aside className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:col-span-1`}>
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-36">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Bộ lọc</h2>
                                <button
                                    onClick={handleResetFilters}
                                    className="text-primary hover:text-primary-dark text-sm font-medium"
                                >
                                    Xóa hết
                                </button>
                            </div>

                            {/* Categories */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Danh mục</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory("all")}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                                            selectedCategory === "all"
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        Tất cả
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id.toString())}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                                                selectedCategory === cat.id.toString()
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Giá tối đa</h3>
                                <input
                                    type="range"
                                    min="0"
                                    max="50000000"
                                    step="1000000"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="w-full"
                                />
                                <p className="text-sm text-gray-600 mt-2">
                                    {maxPrice.toLocaleString("vi-VN")}đ
                                </p>
                            </div>

                            {/* Duration */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Số ngày</h3>
                                <select
                                    value={selectedDuration || ""}
                                    onChange={(e) => setSelectedDuration(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="3">3 ngày</option>
                                    <option value="4">4 ngày</option>
                                    <option value="5">5 ngày</option>
                                    <option value="7">7 ngày</option>
                                </select>
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={minRatingChecked}
                                        onChange={(e) => setMinRatingChecked(e.target.checked)}
                                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-700">Đánh giá 4★ trở lên</span>
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Tours Grid */}
                    <main className="lg:col-span-3">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                                <p className="text-red-700">{error}</p>
                                <button onClick={() => setError(null)}>
                                    <FiX className="text-red-700" />
                                </button>
                            </div>
                        )}

                        {tours.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-gray-600 mb-4">Không tìm thấy tour phù hợp</p>
                                <button
                                    onClick={handleResetFilters}
                                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                                    {tours.map((tour) => (
                                        <TourCard key={tour.id} tour={tour} imagesMap={imagesMap} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiChevronLeft size={20} />
                                        </button>

                                        {[...Array(totalPages)].map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handlePageChange(index)}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                    currentPage === index
                                                        ? 'bg-primary text-white'
                                                        : 'border border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages - 1}
                                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}