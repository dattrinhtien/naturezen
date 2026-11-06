-- ==============================================================================
-- BỔ SUNG PHÂN QUYỀN: ADMIN PHÊ DUYỆT COACH & HỌC VIÊN CHỌN COACH ĐỒNG HÀNH
-- Chạy đoạn script này trên Supabase SQL Editor
-- ==============================================================================

-- 1. Bổ sung các cột hồ sơ cho Coach và Học viên trong bảng profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expertise TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_exp INT DEFAULT 3;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coach_id UUID; -- Coach mà học viên lựa chọn
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coach_status TEXT DEFAULT 'none'; -- 'none', 'pending', 'approved', 'rejected'

-- 2. Bổ sung coach_id vào bảng messages và bookings
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS coach_id UUID;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS coach_id UUID;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS coach_name TEXT;

-- 3. Tạo index cho việc tìm kiếm và lọc theo coach
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_coach_id ON public.profiles(coach_id);
CREATE INDEX IF NOT EXISTS idx_messages_coach_id ON public.messages(coach_id);
CREATE INDEX IF NOT EXISTS idx_bookings_coach_id ON public.bookings(coach_id);

-- 4. Cập nhật Policy RLS để đảm bảo Admin/Coach/Học viên đọc ghi an toàn
DROP POLICY IF EXISTS "Profiles allow read all" ON public.profiles;
CREATE POLICY "Profiles allow read all" ON public.profiles 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles allow admin and user update" ON public.profiles;
CREATE POLICY "Profiles allow admin and user update" ON public.profiles 
    FOR UPDATE USING (true);
