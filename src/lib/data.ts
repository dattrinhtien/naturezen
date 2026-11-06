export interface Lesson {
  id: string;
  orderIndex: number;
  title: string;
  subtitle: string;
  durationMinutes: number;
  audioUrl: string;
  isFreePreview: boolean;
  coreMeaning: string;
  steps: string[];
  ebookSummary: {
    title: string;
    sections: { heading: string; content: string }[];
  };
}

export interface PackagePlan {
  id: string;
  code: string;
  name: string;
  badge?: string;
  description: string;
  price: number;
  originalPrice?: number;
  type: 'digital' | 'single_consult' | 'vip_signature';
  features: string[];
  popular?: boolean;
}

export const SUPABASE_STORAGE_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/meditations`
  : "";

export const BANK_CONFIG = {
  bankId: "MB", // Ngân hàng Quân Đội (hoặc VCB, TCB, ACB, ...)
  bankName: "Ngân hàng TMCP Quân Đội (MBBank)",
  accountNumber: "0988888888", // Số tài khoản mẫu
  accountName: "TRAN THI MINH HANG",
  zaleContact: "https://zalo.me/0988888888",
  phoneSupport: "0988.888.888",
};

export const PACKAGES: PackagePlan[] = [
  {
    id: "pkg-digital-6",
    code: "THIEN6",
    name: "Khoá Số Hoá: 6 Bài Thiền Chuyển Hoá Cảm Xúc",
    badge: "Phổ Biến Nhất",
    description: "Tự học và thực hành tại nhà theo lộ trình 6 bước thấu hiểu cảm xúc, giải phóng tắc nghẽn thân - tâm.",
    price: 890000,
    originalPrice: 1500000,
    type: "digital",
    popular: true,
    features: [
      "Trọn bộ 6 Audio thiền hướng dẫn chuyên sâu do Chị Minh Hằng dẫn thiền",
      "Ebook lý thuyết & bài học chiêm nghiệm đi cùng mỗi buổi thiền",
      "Sổ tay Nhật ký Quán sát Nội tâm số (Somatic & Mood Tracker)",
      "Bộ hẹn giờ tắt thông minh (Sleep Timer) & Nghe nhạc nền tĩnh tại",
      "Sở hữu và truy cập trọn đời trên mọi thiết bị (Điện thoại, Máy tính)"
    ]
  },
  {
    id: "pkg-consult-single",
    code: "TV11LE",
    name: "Tư Vấn Chuyên Sâu 1:1 Đơn Lẻ",
    badge: "Chuyên Sâu",
    description: "Giải quyết trực tiếp điểm tắc nghẽn cụ thể về Năng Lực Tự Nhiên, Thân thể hoặc Cảm xúc.",
    price: 2500000,
    type: "single_consult",
    features: [
      "01 - 02 Buổi tư vấn 1:1 trực tiếp cùng Chị Minh Hằng (Online qua Meet hoặc Trực tiếp)",
      "Tùy chọn chủ đề: Xem NLTN / Đặt tay năng lượng giải tỏa đau thân / Xem Timeline bài học",
      "Phiếu sàng lọc & định hướng năng lượng trước buổi tư vấn (Pre-intake)",
      "Gợi ý bài tập thực hành chuyển hóa riêng theo đặc trưng năng lượng cá nhân",
      "Tặng kèm trọn bộ Khoá Số Hoá 6 Bài Thiền & Ebook"
    ]
  },
  {
    id: "pkg-vip-full",
    code: "VIP8W",
    name: "Lộ Trình Đồng Hành Toàn Diện 8 Tuần",
    badge: "Chuyển Hóa Cao Cấp",
    description: "Hành trình trọn vẹn 6 buổi tư vấn 1:1 kết nối 4 chiều: Tinh thần, Vật lý, Thời gian và Không gian để về Tính Không.",
    price: 7900000,
    originalPrice: 12000000,
    type: "vip_signature",
    features: [
      "06 Buổi tư vấn 1:1 độc quyền trong 8 tuần cùng Chị Minh Hằng:",
      "• Buổi 1 & 2: Thiền xem Năng Lực Tự Nhiên (The Calling)",
      "• Buổi 3: Hướng dẫn thiền quan sát & thấu cảm nội tâm riêng",
      "• Buổi 4: Xem Timeline 1 đời sống quá khứ dùng NLTN & bài học linh hồn",
      "• Buổi 5: Đặt tay năng lượng khai thông các vùng tắc nghẽn trên thân",
      "• Buổi 6: Triết lý NLTN, chuyển hóa tư tưởng & hợp nhất Tính Không",
      "Được hỗ trợ giải đáp & định hướng năng lượng liên tục qua Zalo riêng trong 8 tuần",
      "Không gian thực hành online/offline độc quyền dành cho học viên VIP"
    ]
  }
];

export const LESSONS: Lesson[] = [
  {
    id: "bai-1",
    orderIndex: 1,
    title: "Bài thiền 1: Quan sát cảm xúc",
    subtitle: "Dừng né tránh, sẵn sàng đón nhận và ôm ấp từng con sóng cảm xúc",
    durationMinutes: 13,
    audioUrl: "/audio/bai-thien-1.m4a", // Luôn phát trực tiếp từ Vercel
    isFreePreview: true,
    coreMeaning: "Nhận ra sự sẵn sàng đối diện với cảm xúc và hiểu rằng cảm xúc tiêu cực không phải là điều đáng sợ hay không thể vượt qua.",
    steps: [
      "Bước 1: Thả lỏng cơ thể - Tìm tư thế thoải mái (nằm hoặc ngồi tựa lưng), nhắm nhẹ đôi mắt và hít thở điều hòa.",
      "Bước 2: Gợi lại cảm xúc - Hướng suy nghĩ về một cảm xúc đang khiến bạn mệt mỏi, nặng nề. Thay vì chối bỏ hay tìm quên, bạn chọn dừng lại và sẵn sàng đối diện.",
      "Bước 3: Chìm vào 'hồ nước cảm xúc' - Hình dung cảm xúc như hồ nước đầy sóng. Thả lỏng và chìm dần vào hồ nước, để cảm xúc lan ra toàn thân mà không phân tích, đánh giá hay phê phán.",
      "Bước 4: Kết thúc - Khi nhận thấy các cơn sóng cảm xúc chậm dần và dừng lại, hít thở vài hơi nhẹ nhàng rồi thoát thiền."
    ],
    ebookSummary: {
      title: "Tuần 1: Đi vào nội tâm để thấu hiểu bản thân",
      sections: [
        {
          heading: "Chiếc gương soi chiếu thực sự",
          content: "Chúng ta thường tìm kiếm chiếc gương soi từ bên ngoài: xã hội, gia đình, sự đánh giá của người khác. Nhưng những lời khen từ bên ngoài không bao giờ làm ta thỏa mãn nếu bên trong ta thiếu đi sự công nhận tự thân. Chỉ khi quay về bên trong, ta mới soi chiếu trọn vẹn bản thân mình."
        },
        {
          heading: "Sự quan sát thực sự là gì?",
          content: "Sự quan sát thực sự không phải là đứng ngoài để phán xét đúng hay sai. Sự quan sát thực sự là khi bạn hòa làm một với khung cảnh, với cảm xúc và với con người mình, cho phép mọi cảm xúc được hiện diện đầy đủ để tự tan biến."
        }
      ]
    }
  },
  {
    id: "bai-2",
    orderIndex: 2,
    title: "Bài thiền 2: Chấp nhận cảm xúc",
    subtitle: "Xóa bỏ ranh giới phân biệt, ghi nhận và sống trọn vẹn với sự thật nội tâm",
    durationMinutes: 10,
    audioUrl: "/audio/bai-thien-1.m4a",
    isFreePreview: false,
    coreMeaning: "Chìm vào và cảm nhận cảm xúc mà không phân tích hay đánh giá chính là cách chúng ta quan sát sự thật của cảm xúc đúng như bản chất vốn có của nó.",
    steps: [
      "Bước 1: Chuẩn bị & Thả lỏng cơ thể.",
      "Bước 2: Gợi lại cảm xúc khiến bạn mệt mỏi, dằn vặt.",
      "Bước 3: Ghi nhận & Hiện diện - Bật mở sự nhận biết trong nội tâm: 'Ồ, tôi có cảm xúc này. Tôi biết cảm xúc này'.",
      "Bước 4: Chìm vào & Chấp nhận - Coi cảm xúc như những cơn sóng đến rồi đi; cảm nhận và thả trôi cho đến khi dịu dần."
    ],
    ebookSummary: {
      title: "Ngày 2: Chấp nhận cảm xúc nguyên bản",
      sections: [
        {
          heading: "Nhận biết không phán xét",
          content: "Đón nhận các ký ức, câu nói hay suy nghĩ dằn vặt đi kèm mà không né tránh hay tự trách. Việc trực tiếp chạm vào và chìm vào cảm xúc là chìa khóa tháo gỡ đầu tiên."
        }
      ]
    }
  },
  {
    id: "bai-3",
    orderIndex: 3,
    title: "Bài thiền 3: Đi qua từng lớp của cảm xúc",
    subtitle: "Bóc tách củ hành tây nội tâm: từ cơn giận bề mặt đến nỗi sợ và sự thiếu thốn",
    durationMinutes: 39,
    audioUrl: "/audio/bai-thien-1.m4a",
    isFreePreview: false,
    coreMeaning: "Những khối cảm xúc dồn nén lâu ngày có cấu trúc nhiều tầng lớp. Bóc tách từng lớp giúp năng lượng cảm xúc được giải phóng hoàn toàn và không quay trở lại.",
    steps: [
      "Bước 1: Chuẩn bị & Thả lỏng toàn thân.",
      "Bước 2: Gợi lại khối cảm xúc nặng nề.",
      "Bước 3: Chìm vào lớp cảm xúc bề mặt (giận dữ, buồn phiền, chán nản...).",
      "Bước 4: Chấp nhận sự chống đối của cơ thể & Bóc tách các lớp sâu hơn (nỗi sợ, cảm giác thiếu thốn, sự tổn thương).",
      "Bước 5: Giải phóng cảm xúc - Cho phép cảm xúc bộc lộ trọn vẹn và tự tan biến về tính Không."
    ],
    ebookSummary: {
      title: "Ngày 3: Đi đến tận cùng thì chuyển hoá",
      sections: [
        {
          heading: "Các tầng của hồ nước cảm xúc",
          content: "Tầng mặt là cảm xúc sôi sục. Tầng nông là cảm xúc sâu xa tích tụ. Tầng giữa là tư tưởng nguyên nhân. Tầng sâu là gốc rễ vì sao có tư tưởng đó. Vào đến đáy, bạn bừng tỉnh và chạm vào tính Không bình yên."
        }
      ]
    }
  },
  {
    id: "bai-4",
    orderIndex: 4,
    title: "Bài thiền 4: Quan sát cảm giác trên thân thể liên quan đến cảm xúc",
    subtitle: "Khám phá mối liên hệ tương hỗ Thân - Tâm: tuy hai mà một",
    durationMinutes: 24,
    audioUrl: "/audio/bai-thien-1.m4a",
    isFreePreview: false,
    coreMeaning: "Cảm xúc tác động trực tiếp lên cơ thể vật lý (lo lắng gây đau dạ dày, buồn bã gây kiệt sức). Nhận biết cảm giác trên thân là bước quan trọng để tháo gỡ điểm tắc.",
    steps: [
      "Bước 1: Chuẩn bị & Thả lỏng cơ thể mềm ra.",
      "Bước 2: Gợi lại cảm xúc mệt mỏi.",
      "Bước 3: Chuyển sự chú ý sang thân thể - Chú ý tới đau ở ngực, mỏi ở vai, buốt trong dạ dày, tê tay chân.",
      "Bước 4: Nhận biết không cần gọi tên - Chỉ cần cảm nhận và biết chúng đang hiện diện trên cơ thể."
    ],
    ebookSummary: {
      title: "Ngày 4: Thân và Tâm - Mối liên hệ không thể tách rời",
      sections: [
        {
          heading: "Cơ thể lưu trữ cảm xúc",
          content: "Mọi cảm xúc bị dồn nén đều để lại dấu vết vật lý trên các cơ quan và bó cơ. Chữa lành cảm xúc chính là phương thuốc tái tạo sức khỏe cho cơ thể."
        }
      ]
    }
  },
  {
    id: "bai-5",
    orderIndex: 5,
    title: "Bài thiền 5: Cảm nhận và chấp nhận cảm giác trên thân",
    subtitle: "Chìm vào cơn đau vật lý, chấp nhận sự chống đối để đạt đến sự tĩnh lặng sâu sắc",
    durationMinutes: 26,
    audioUrl: "/audio/bai-thien-1.m4a",
    isFreePreview: false,
    coreMeaning: "Chấp nhận cả cơn đau lẫn phản ứng chống đối của cơ thể giúp cơn đau đạt đỉnh rồi tự tan biến, đưa tâm trí và thân thể về trạng thái an lạc tĩnh lặng tuyệt đối.",
    steps: [
      "Bước 1: Thả lỏng toàn thân.",
      "Bước 2: Gợi lại cảm giác trên thân đang nổi lên.",
      "Bước 3: Chìm vào & Chấp nhận cảm giác trên thân - Để cơn đau lan tỏa toàn bộ cơ thể theo hơi thở ra mà không phán xét.",
      "Bước 4: Cảm nhận sự tĩnh lặng - Khi cảm giác qua đi, nán lại trong sự tĩnh lặng thuần khiết."
    ],
    ebookSummary: {
      title: "Ngày 5: Cơ chế tháo gỡ điểm nghẽn vật lý",
      sections: [
        {
          heading: "Lan tỏa hơi thở chữa lành",
          content: "Cơn đau sinh ra từ năng lượng bị ứ tắc. Khi không còn sự kháng cự, năng lượng được lưu thông tự nhiên và cơ thể tự hồi phục."
        }
      ]
    }
  },
  {
    id: "bai-6",
    orderIndex: 6,
    title: "Bài thiền 6: Chấp nhận các khía cạnh khác nhau của bản thân",
    subtitle: "Hòa hợp con người ưu điểm & nhược điểm, ôm ấp phần tối nội tâm với lòng từ bi",
    durationMinutes: 50,
    audioUrl: "/audio/bai-thien-1.m4a",
    isFreePreview: false,
    coreMeaning: "Bên trong luôn có hai con người Âm - Dương. Ghi nhận ưu điểm và ôm ấp nhược điểm (ích kỷ, cô đơn, tâm lý nạn nhân) chính là chìa khóa đạt tới tình yêu thương chân thật và bình yên vững chãi.",
    steps: [
      "Bước 1: Thả lỏng cơ thể.",
      "Bước 2: Gợi lại nỗi niềm hay trăn trở trở đi trở lại.",
      "Bước 3: Chìm vào hồ nước cảm xúc đồng thời với các cảm giác trên thân thể.",
      "Bước 4: Nhận diện & Ôm ấp khía cạnh tiêu cực - Nhận diện phần ích kỷ, sợ hãi hoặc nạn nhân mà không chối bỏ, lan tỏa tình yêu thương đến chính mình.",
      "Bước 5: Viết nhật ký thực hành - Ghi nhận lại tiến bộ nội tâm mỗi ngày."
    ],
    ebookSummary: {
      title: "Ngày 6: Yêu thương trọn vẹn chính mình & Về Tính Không",
      sections: [
        {
          heading: "Biết ơn những bế tắc và khó khăn",
          content: "Những vướng mắc và mệt mỏi chính là hoàn cảnh quý giá nhất mà cuộc đời trao tặng để bạn thấu hiểu chính mình, thấu suốt bản chất và tìm về tiếng gọi Năng Lực Tự Nhiên."
        }
      ]
    }
  }
];

