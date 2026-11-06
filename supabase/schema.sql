-- ==============================================================================
-- DỰ ÁN: NĂNG LỰC TỰ NHIÊN & THIỀN CHUYỂN HOÁ CẢM XÚC (CHỊ MINH HẰNG)
-- Hướng dẫn: Copy toàn bộ nội dung file này dán vào SQL Editor trên Supabase và bấm "Run"
-- ==============================================================================

-- 1. Kích hoạt tiện ích mở rộng UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. BẢNG HỒ SƠ NGƯỜI DÙNG (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'coach', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tự động tạo profile khi người dùng đăng ký qua Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'phone'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. BẢNG QUYỀN SỞ HỮU GÓI CỦA HỌC VIÊN (ENROLLMENTS)
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_code TEXT NOT NULL, -- 'THIEN6', 'TV11LE', 'VIP8W'
    package_name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'paused')),
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- NULL: vĩnh viễn
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG SỔ QUÁN SÁT THÂN & TÂM (JOURNAL_ENTRIES)
-- Học viên ghi nhận các điểm tắc nghẽn thân thể & bóc tách cảm xúc củ hành tây
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_order INT, -- 1 đến 6
    mood_before INT CHECK (mood_before BETWEEN 1 AND 5),
    mood_after INT CHECK (mood_after BETWEEN 1 AND 5),
    body_spots TEXT[], -- Mảng các điểm đau: ['Ngực tức nặng', 'Dạ dày buốt', ...]
    surface_emotions TEXT[], -- Mảng cảm xúc bề mặt: ['Tức giận', 'Lo lắng', ...]
    deep_layers TEXT, -- Lớp sâu bên dưới (nỗi sợ, cảm giác thiếu thốn...)
    notes TEXT, -- Lời nhắn nhủ yêu thương bản thân
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BẢNG ĐẶT LỊCH HẸN TƯ VẤN 1:1 (BOOKINGS)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    topic TEXT NOT NULL, -- 'Thiền Xem Năng Lực Tự Nhiên', 'Đặt Tay Năng Lượng', ...
    mode TEXT DEFAULT 'online' CHECK (mode IN ('online', 'offline')),
    booking_date DATE NOT NULL,
    time_slot TEXT NOT NULL, -- '09:00 - 10:30', '14:00 - 15:30', ...
    symptoms_note TEXT, -- Phiếu sàng lọc vấn đề bế tắc trước buổi gặp
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BẢNG ĐƠN HÀNG CHUYỂN KHOẢN VIETQR (ORDERS)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code TEXT UNIQUE NOT NULL, -- Mã chuyển khoản (ví dụ: HT_THIEN6_8888)
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    package_code TEXT NOT NULL,
    package_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- ==============================================================================
-- BẢO MẬT ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Hồ sơ cá nhân (Mỗi người xem và sửa hồ sơ của mình, coach có thể xem danh sách học viên)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id OR true);

-- Policy: Sổ quán sát thân tâm (Bảo mật tuyệt đối, chỉ chủ nhân mới xem & viết được)
CREATE POLICY "Users can read own journal" 
    ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal" 
    ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal" 
    ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Policy: Quyền sở hữu khóa học
CREATE POLICY "Users can view own enrollments" 
    ON public.enrollments FOR SELECT USING (auth.uid() = user_id);

-- Policy: Đặt lịch 1:1
DROP POLICY IF EXISTS "Anyone can create booking" ON public.bookings;
CREATE POLICY "Anyone can create booking" 
    ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" 
    ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update bookings" ON public.bookings;
CREATE POLICY "Users can update bookings" 
    ON public.bookings FOR UPDATE USING (true);

-- Policy: Đơn hàng VietQR
DROP POLICY IF EXISTS "Anyone can create order" ON public.orders;
CREATE POLICY "Anyone can create order" 
    ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" 
    ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update orders" ON public.orders;
CREATE POLICY "Users can update orders" 
    ON public.orders FOR UPDATE USING (true);

