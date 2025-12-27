import { redirect } from "next/navigation";

export default function InfoRootPage() {
  // Tự động chuyển hướng vào bài viết đầu tiên (Giới thiệu)
  redirect("/thong-tin/gioi-thieu");
}