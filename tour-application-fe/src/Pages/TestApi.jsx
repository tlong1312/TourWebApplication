import { useEffect } from "react";
import {
  getCategories,
  getTours,
  getTourById,
  searchTours,
} from "../utils/api/TourApi";

export default function TestApi() {
  useEffect(() => {
    const runTests = async () => {
      try {
        console.log("🔹 Test: Lấy danh sách category");
        const resCate = await getCategories();
        console.log("✅ Category:", resCate.data);

        console.log("🔹 Test: Lấy danh sách tour");
        const resTour = await getTours();
        console.log("✅ Tour:", resTour.data);

        console.log("🔹 Test: Search tour theo từ khoá");
        const search = await searchTours({ keyword: "biển" });
        console.log("✅ Kết quả search:", search.data);
        console.log("🔹 Test: Lấy chi tiết tour theo ID");
        const TourDetail = await getTourById(2); // Thay 1 bằng ID tour hợp lệ
        console.log("✅ Chi tiết Tour:", TourDetail.data);
        console.log("🔹 Test: Lấy lịch trình tour theo Tour ID");
        console.log(TourDetail.itineraries);




      } catch (err) {
        console.error("❌ Lỗi test API:", err.response?.data || err.message);
      }
    };

    runTests();
  }, []);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>🧪 Test API Tour Application</h1>
      <p>Kiểm tra console (F12 → tab Console) để xem kết quả test API.</p>
    </main>
  );
}
