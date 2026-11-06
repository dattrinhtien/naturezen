-- ==============================================================================
-- BỔ SUNG PHÂN QUYỀN: ADMIN PHÊ DUYỆT COACH & KÍCH HOẠT 3 TÀI KHOẢN MẪU
-- Copy toàn bộ nội dung file này dán vào SQL Editor trên Supabase và bấm "Run"
-- ==============================================================================

-- 1. Bổ sung các cột thông tin cho Coach và Học viên
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expertise TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_exp INT DEFAULT 5;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coach_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coach_status TEXT DEFAULT 'none';

-- 2. Bổ sung coach_id vào bảng messages và bookings
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS coach_id UUID;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS coach_id UUID;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS coach_name TEXT;

-- 3. Tạo index tăng tốc độ tìm kiếm
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_coach_id ON public.profiles(coach_id);
CREATE INDEX IF NOT EXISTS idx_messages_coach_id ON public.messages(coach_id);
CREATE INDEX IF NOT EXISTS idx_bookings_coach_id ON public.bookings(coach_id);

-- 4. Cấu hình bảo mật Row Level Security (RLS) an toàn
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select profiles" ON public.profiles;
CREATE POLICY "Allow select profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert profiles" ON public.profiles;
CREATE POLICY "Allow insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update profiles" ON public.profiles;
CREATE POLICY "Allow update profiles" ON public.profiles FOR UPDATE USING (true);

-- 5. Kích hoạt vai trò cho 3 tài khoản đã được khởi tạo
INSERT INTO public.profiles (id, email, full_name, phone, role, coach_status, expertise, bio, years_exp)
SELECT id, email, 'Tổng Quản Trị Viên', '0906115528', 'admin', 'none', 'Quản trị hệ thống', 'Quản trị toàn bộ hệ sinh thái Năng Lực Tự Nhiên', 10
FROM auth.users WHERE email = 'admin@naturezen.vn'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

INSERT INTO public.profiles (id, email, full_name, phone, role, coach_status, expertise, bio, years_exp)
SELECT id, email, 'Chị Minh Hằng', '0906115528', 'coach', 'approved', 'Thiền Năng Lực Tự Nhiên & Chuyển Hoá Cảm Xúc Thân Tâm', 'Hơn 10 năm nghiên cứu và ứng dụng Năng Lực Tự Nhiên, hỗ trợ tháo gỡ bế tắc cảm xúc và điểm đau thân thể.', 10
FROM auth.users WHERE email = 'minhhang@naturezen.vn'
ON CONFLICT (id) DO UPDATE SET role = 'coach', coach_status = 'approved';

INSERT INTO public.profiles (id, email, full_name, phone, role, coach_status)
SELECT id, email, 'Nguyễn Thu Hà', '0988776655', 'student', 'none'
FROM auth.users WHERE email = 'hocvien@naturezen.vn'
ON CONFLICT (id) DO UPDATE SET role = 'student';
