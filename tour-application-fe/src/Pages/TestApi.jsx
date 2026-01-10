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

        // 👇 Nếu chưa có category nào thì thêm thử:
        // const form = new FormData();
        // form.append("name", "Du lịch Biển");
        // form.append("description", "Các tour nghỉ dưỡng biển");
        // const created = await createCategory(form);
        // console.log("✅ Tạo Category:", created.data);

        console.log("🔹 Test: Lấy danh sách tour");
        const resTour = await getTours();
        console.log("✅ Tour:", resTour.data);

        console.log("🔹 Test: Search tour theo từ khoá");
        const search = await searchTours({ keyword: "biển" });
        console.log("✅ Kết quả search:", search.data);

        // get tour by tour id
        console.log("🔹 Test: Lấy chi tiết tour theo ID");
        const TourDetail = await getTourById(2); // Thay 1 bằng ID tour hợp lệ
        console.log("✅ Chi tiết Tour:", TourDetail.data);

        // tour itinerary
        console.log("🔹 Test: Lấy lịch trình tour theo Tour ID");
        console.log(TourDetail.itineraries);

        // tour-schedule by tour id




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
