# Glow Beauty (WebShop)

Cửa hàng **mỹ phẩm** trực tuyến: React (Vite) + TanStack, ASP.NET Core 8, MongoDB. Thanh toán **COD** (trả tiền khi nhận hàng). Giao diện **tiếng Việt**.

Danh mục mẫu: chăm sóc da, trang điểm, chăm sóc tóc, nước hoa & body.

## Tính năng

### Khách hàng
- Xem danh mục & sản phẩm, tìm kiếm
- Giỏ hàng (khách vãng lai qua `X-Session-Id`, đồng bộ khi đăng nhập)
- Đặt hàng COD, theo dõi đơn hàng

### Admin / Nhân viên
- Dashboard: doanh thu, đơn theo trạng thái, cảnh báo tồn kho
- CRUD sản phẩm & danh mục
- Quản lý kho (điều chỉnh, lịch sử)
- Quản lý đơn hàng (cập nhật trạng thái)
- Quản lý người dùng (chỉ Admin)

## Yêu cầu

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) hoặc Docker

## Chạy nhanh (development)

### 1. MongoDB

```bash
docker compose up mongodb -d
```

Hoặc cài MongoDB local tại `mongodb://localhost:27017`.

### 2. Backend

```bash
cd server/WebShop.Api
dotnet run
```

API: http://localhost:5000 — Swagger: http://localhost:5000/swagger

**Reset demo (tránh dữ liệu cũ):** Đăng nhập Admin → **Tổng quan** → mục *Reset dữ liệu demo*, gõ `RESET-DEMO` để xác nhận. API: `POST /api/admin/demo/reset` (bật khi `DemoReset:Enabled: true` trong Development, hoặc `ALLOW_DEMO_RESET=true` trên server).

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

UI: http://localhost:5173

## Tài khoản quản trị (bootstrap)

Admin **không** được hardcode trong mã nguồn. Lần đầu chạy API, nếu chưa có user `Admin` trong MongoDB, hệ thống tạo một tài khoản từ biến môi trường:

| Biến | Mô tả |
|------|--------|
| `BOOTSTRAP_ADMIN_EMAIL` | Email admin |
| `BOOTSTRAP_ADMIN_PASSWORD` | Mật khẩu (SHA256 + salt, lưu trong DB) |

**Development:** đã cấu hình sẵn trong `server/WebShop.Api/Properties/launchSettings.json` (profile `http`):

- Email: `admin@glowbeauty.vn`
- Mật khẩu: `GlowAdmin@2026`

**Production:** đặt biến môi trường trên host/Docker (xem `.env.example`), sau đó đổi mật khẩu trong **Quản trị → Tài khoản**.

Nhân viên: Admin tạo thêm trong dashboard. Khách hàng: đăng ký tại `/dang-ky`.

## Docker (API + MongoDB)

```bash
docker compose up --build
```

API: http://localhost:5000 — Chạy frontend riêng với `npm run dev` trong `client/`.

## Cấu trúc

```
WebShop/
├── client/          # React + Vite + TanStack
├── server/
│   ├── WebShop.Api/
│   ├── WebShop.Application/
│   ├── WebShop.Domain/
│   └── WebShop.Infrastructure/
├── docker-compose.yml
└── WebShop.sln
```

## Bảo mật

- JWT Bearer + refresh token (lưu DB)
- Policies: `CustomerOnly`, `StaffOrAdmin`, `AdminOnly`
- Mặc định `RequireAuthenticatedUser`; route public dùng `[AllowAnonymous]`
- Kiểm tra quyền sở hữu đơn hàng ở backend

## Smoke test

- [ ] Đăng ký khách → thêm giỏ → thanh toán COD
- [ ] Staff xác nhận → giao hàng → trạng thái Paid
- [ ] Khách A không xem đơn khách B (403)
- [ ] Staff không truy cập `/admin/nguoi-dung` (403)
- [ ] Đặt hàng vượt tồn kho → lỗi, không trừ kho
- [ ] Catalog xem được khi chưa đăng nhập; POST sản phẩm bị từ chối

## Lưu ý

- Đổi `Jwt:Secret` trong production.
- Token lưu `localStorage` (phase 1); cân nhắc httpOnly cookie cho production.
