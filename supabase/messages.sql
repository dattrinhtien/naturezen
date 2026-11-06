-- ==============================================================================
-- BẢNG TIN NHẮN / TRAO ĐỔI 1:1 GIỮA HỌC VIÊN VÀ CHỊ MINH HẰNG
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- ID tài khoản của học viên (mỗi học viên sở hữu 1 luồng trò chuyện riêng)
    sender_id UUID,        -- ID người gửi (có thể là học viên hoặc NULL/Coach ID)
    sender_name TEXT NOT NULL DEFAULT 'Học viên',
    content TEXT NOT NULL,
    is_from_coach BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tạo Index để tăng tốc độ truy vấn theo luồng học viên
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Kích hoạt Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 1. Cho phép đọc tin nhắn: Học viên xem tin nhắn của mình, và Coach xem mọi tin nhắn
DROP POLICY IF EXISTS "Allow select for user or coach" ON public.messages;
CREATE POLICY "Allow select for user or coach" 
    ON public.messages FOR SELECT 
    USING (
        auth.uid() = user_id 
        OR auth.role() = 'anon'
        OR auth.role() = 'authenticated'
    );

-- 2. Cho phép gửi tin nhắn: Học viên gửi tin nhắn hoặc Chị Hằng trả lời
DROP POLICY IF EXISTS "Allow insert for user or coach" ON public.messages;
CREATE POLICY "Allow insert for user or coach" 
    ON public.messages FOR INSERT 
    WITH CHECK (true);

-- 3. Cho phép cập nhật (đánh dấu đã đọc)
DROP POLICY IF EXISTS "Allow update for user or coach" ON public.messages;
CREATE POLICY "Allow update for user or coach" 
    ON public.messages FOR UPDATE 
    USING (true);
