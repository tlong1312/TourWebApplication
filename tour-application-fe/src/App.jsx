import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";
import Chatbot from "./Components/Chatbot/Chatbot";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import EditProfile from "./Pages/Profile/EditProfile";
import ChangePassword from "./Pages/Profile/ChangePassword";
import ProfilePage from "./Pages/Profile/ProfilePage";
import BookingHistory from "./Pages/Profile/BookingHistory";
import Tourpage from "./Pages/Tourpage/Tourpage";
import TourDetail from "./Pages/TourDetail/TourDetail";
import Home from "./Pages/Home/Home";
import TestApi from "./Pages/TestApi";
import Booking from "./Pages/Booking/BookingTour";
import VnpayReturnPage from "./Pages/Booking/VnpayReturnPage";
import TourAdminPage from "./Pages/Admin/TourAdminPage";
import AddTour from "./Pages/Admin/AddTour";
import AddCategory from "./Pages/Admin/AddCategory";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import Navbar from "./Components/Header/Navbar";
import CategoriesAdminPage from "./Pages/Admin/CatoriesAdminPage";
import AdminPage from "./Pages/Admin/AdminPage";
import AddAdmin from "./Pages/Admin/AddAdmin";
import UpdateTour from "./Pages/Admin/UpdateTour";
import UpdateCategory from "./Pages/Admin/UpdateCategory";
import TourDetailAdmin from "./Pages/Admin/TourDetail";
import AddTourItinerary from "./Pages/Admin/AddTourItinerary";
import UpdateTourItinerary from "./Pages/Admin/UpdateTourItinerary";
import AddTourSchedule from "./Pages/Admin/AddTourSchedule";
import UpdateTourSchedule from "./Pages/Admin/UpdateTourSchedule";
import UpdateAdmin from "./Pages/Admin/UpdateAdmin";
import BookingAdminPage from "./Pages/Admin/BookingAdminPage";
import BookingDetailAdmin from "./Pages/Admin/BookingDetailAdmin";
import StatisticsPage from "./Pages/Admin/StatisticsPage";
import BookingDetail from "./Pages/Profile/BookingDetail";

export default function App() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith("/admin");
    const isHomePage = location.pathname === "/";
    
    return (
        <div className="min-h-screen flex flex-col">
            {isAdminRoute ? <Navbar /> : <Header />}

            {/* Add padding-top to prevent header overlap, except on homepage */}
            <main className={isHomePage ? "" : "pt-20"}>
                <Routes>
                    {/* --- ADMIN ROUTES --- */}
                    <Route path="/admin/tours" element={<TourAdminPage/>} />
                    <Route path="/admin/tours/add" element={<AddTour/>} />
                    <Route path="/admin/tours/update/:id" element={<UpdateTour />} />
                    <Route path="/admin/tours/detail/:id" element={<TourDetailAdmin/>} />
                    <Route path="/admin/tours/:id/itinerary/add" element={<AddTourItinerary />} />
                    <Route path="/admin/tours/:id/itinerary/update" element={<UpdateTourItinerary />} />
                    <Route path="/admin/tours/:id/schedules/add" element={<AddTourSchedule />} />
                    <Route path="/admin/tours/:id/schedules/update/:scheduleId" element={<UpdateTourSchedule />} />
                    <Route path="/admin/categories" element={<CategoriesAdminPage />} />
                    <Route path="/admin/categories/add" element={<AddCategory/>} />
                    <Route path="/admin/categories/update/:id" element={<UpdateCategory />} />
                    <Route path="/admin/users" element={<AdminPage />} />
                    <Route path="/admin/add" element={<AddAdmin />} />
                    <Route path="/admin/update/:id" element={<UpdateAdmin />} />
                    <Route path="/admin/bookings" element={<BookingAdminPage />} />
                    <Route path="/admin/bookings/detail/:bookingCode" element={<BookingDetailAdmin />} />
                    <Route path="/admin/statistics" element={<StatisticsPage />} />

                    {/* --- USER ROUTES --- */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/testapi" element={<TestApi />} />
                    <Route path="/tours" element={<Tourpage />} />
                    <Route path="/tours/:id" element={<TourDetail />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/editprofile" element={<EditProfile />} />
                    <Route path="/changepassword" element={<ChangePassword />} />
                    <Route path="/booking-history" element={<BookingHistory />} />
                    <Route path="/bookingtour" element={<Booking />} />
                    <Route path="/booking-details/:id" element={<BookingDetail />} />
                    <Route path="/vnpay-return" element={<VnpayReturnPage />} />
                </Routes>
            </main>

            <Chatbot />
            <Footer />
        </div>
    );
}