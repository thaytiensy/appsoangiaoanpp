import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LessonInputSchema, LessonPlanOutputSchema, type LessonPlanOutput } from '@/contracts/app.schema';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const rawBody: unknown = await req.json();
    const input = LessonInputSchema.parse(rawBody);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY trong file .env' }, { status: 500 });
    }

    const standardDoc = input.grade <= 5 ? 'Công văn 2345/BGDĐT-GDTH' : 'Công văn 5512/BGDĐT-GDTrH';
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({
      model: 'gemini-3.8-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const prompt = `
Bạn là chuyên gia sư phạm hàng đầu Việt Nam. Hãy soạn Kế hoạch bài dạy (Giáo án) theo chuẩn ${standardDoc} và Cấu trúc Slide PowerPoint 16:9 cho bài học sau:

THÔNG TIN BÀI HỌC:
- Môn học: ${input.subject} - Lớp: ${input.grade}
- Bộ sách giáo khoa: ${input.textbook}
- Tên bài học / Chủ đề: ${input.topic}
- Thời lượng: ${input.durationMinutes} phút (${input.periodNumber})
- Đơn vị: ${input.schoolName} - Tổ: ${input.facultyName} - GV: ${input.teacherName}
- Ghi chú sư phạm: ${input.additionalNotes || 'Không có'}

YÊU CẦU ĐẦU RA (JSON FORMAT):
Bạn phải trả về đúng cấu trúc JSON sau:
{
  "id": "lp_${Date.now()}",
  "metadata": ${JSON.stringify(input)},
  "objectives": {
    "knowledge": "Nêu rõ kiến thức học sinh tiếp thu được",
    "coreCompetencies": "Năng lực chung: tự chủ, giao tiếp hợp tác, giải quyết vấn đề",
    "specificCompetencies": "Năng lực đặc thù của môn ${input.subject}",
    "qualities": "Phẩm chất: yêu nước, nhân ái, chăm chỉ, trung thực, trách nhiệm"
  },
  "materials": {
    "teacherPreparation": "Thiết bị, kế hoạch bài dạy, bài giảng PowerPoint, phiếu học tập",
    "studentPreparation": "Sách giáo khoa, vở ghi, đồ dùng học tập"
  },
  "activities": [
    {
      "stepName": "Hoạt động 1: Mở đầu / Khởi động",
      "duration": "5 - 7 phút",
      "objective": "Tạo hứng thú và kết nối kiến thức thực tế",
      "content": "Nội dung câu hỏi, trò chơi hoặc tình huống thực tiễn",
      "product": "Câu trả lời, kết quả dự đoán của học sinh",
      "implementation": {
        "transferTask": "Giáo viên nêu luật chơi/câu hỏi/tình huống",
        "performTask": "Học sinh suy nghĩ cá nhân hoặc trao đổi theo cặp",
        "reportDiscuss": "Học sinh xung phong trả lời, nhận xét bạn",
        "concludeJudge": "Giáo viên đánh giá, chốt vấn đề và dẫn dắt vào bài mới"
      }
    },
    {
      "stepName": "Hoạt động 2: Hình thành kiến thức mới",
      "duration": "20 - 25 phút",
      "objective": "Chiếm lĩnh kiến thức trọng tâm bài học",
      "content": "Các đơn vị kiến thức cần tìm hiểu trong sách giáo khoa",
      "product": "Vở ghi của học sinh, bảng nhóm, phiếu học tập",
      "implementation": {
        "transferTask": "Giáo viên giao nhiệm vụ học tập theo nhóm/cá nhân",
        "performTask": "Học sinh nghiên cứu tài liệu, thảo luận hoàn thành phiếu",
        "reportDiscuss": "Đại diện nhóm báo cáo, các nhóm khác phản biện",
        "concludeJudge": "Giáo viên chính xác hóa kiến thức trọng tâm"
      }
    },
    {
      "stepName": "Hoạt động 3: Luyện tập",
      "duration": "8 - 10 phút",
      "objective": "Củng cố và rèn luyện kỹ năng qua bài tập",
      "content": "Hệ thống bài tập trắc nghiệm và tự luận cơ bản",
      "product": "Lời giải bài tập của học sinh trong vở",
      "implementation": {
        "transferTask": "Giáo viên giao bài tập cho học sinh làm",
        "performTask": "Học sinh độc lập làm bài tập",
        "reportDiscuss": "Gọi học sinh lên bảng hoặc chấm điểm chữa bài",
        "concludeJudge": "Giáo viên nhận xét, lưu ý lỗi sai thường gặp"
      }
    },
    {
      "stepName": "Hoạt động 4: Vận dụng",
      "duration": "3 - 5 phút",
      "objective": "Vận dụng kiến thức giải quyết vấn đề thực tế",
      "content": "Nhiệm vụ thực tế hoặc mở rộng kiến thức",
      "product": "Sản phẩm tìm tòi của học sinh nộp vào tiết sau",
      "implementation": {
        "transferTask": "Giáo viên giao nhiệm vụ về nhà có tính thực tế",
        "performTask": "Học sinh thực hiện tại nhà cùng gia đình/nhóm",
        "reportDiscuss": "Báo cáo sản phẩm vào buổi học tiếp theo",
        "concludeJudge": "Giáo viên hướng dẫn tài liệu tham khảo bổ trợ"
      }
    }
  ],
  "slides": [
    {
      "slideNumber": 1,
      "title": "${input.topic}",
      "bulletPoints": ["Môn: ${input.subject} - Lớp ${input.grade}", "Giáo viên: ${input.teacherName}", "Bộ sách: ${input.textbook}"],
      "visualNote": "Hình nền trang nhã, logo trường, hình ảnh biểu trưng môn học",
      "speakerNotes": "Chào mừng quý thầy cô và các em học sinh đến với tiết học hôm nay."
    },
    {
      "slideNumber": 2,
      "title": "Mục Tiêu Bài Học",
      "bulletPoints": ["Kiến thức trọng tâm bài học", "Năng lực cần rèn luyện", "Phẩm chất hình thành"],
      "visualNote": "Sơ đồ nhánh 3 mục tiêu hoặc 3 icon trực quan",
      "speakerNotes": "Hôm nay chúng ta sẽ cùng chinh phục các mục tiêu chính sau..."
    },
    {
      "slideNumber": 3,
      "title": "Khởi Động: Khám Phá Thực Tiễn",
      "bulletPoints": ["Tình huống thực tế dẫn nhập", "Câu hỏi gợi mở suy nghĩ"],
      "visualNote": "Hình ảnh hoặc video ngắn về tình huống thực tế đời sống",
      "speakerNotes": "Trước khi vào bài mới, mời các em quan sát tình huống sau..."
    },
    {
      "slideNumber": 4,
      "title": "Khám Phá: Khái Niệm Trọng Tâm",
      "bulletPoints": ["Định nghĩa và bản chất", "Công thức / Quy tắc ghi nhớ", "Ví dụ minh họa chi tiết"],
      "visualNote": "Bảng tổng hợp công thức nổi bật với màu sắc tương phản",
      "speakerNotes": "Đây là nội dung cốt lõi của bài học, các em chú ý ghi chép..."
    },
    {
      "slideNumber": 5,
      "title": "Luyện Tập & Củng Cố",
      "bulletPoints": ["Bài tập mẫu có lời giải chi tiết", "Bài tập thực hành nhanh cho học sinh"],
      "visualNote": "Bố cục chia 2 cột Đề bài và Hướng dẫn phương pháp giải",
      "speakerNotes": "Bây giờ chúng ta cùng vận dụng kiến thức vừa học để làm bài tập..."
    },
    {
      "slideNumber": 6,
      "title": "Vận Dụng & Dặn Dò Về Nhà",
      "bulletPoints": ["Nhiệm vụ thực tế tại nhà", "Chuẩn bị bài học tiết tiếp theo"],
      "visualNote": "Icon ngôi sao thành tích và ghi chú bài tập về nhà",
      "speakerNotes": "Tiết học của chúng ta tạm kết thúc tại đây, hẹn gặp lại các em vào buổi tới."
    }
  ],
  "createdAt": "${new Date().toISOString()}"
}
`.trim();

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const cleanJson = rawText.replace(/```json\n?|```/g, '').trim();

    const parsedData: unknown = JSON.parse(cleanJson);
    const validated: LessonPlanOutput = LessonPlanOutputSchema.parse(parsedData);

    return NextResponse.json(validated);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Lỗi xử lý sinh giáo án: ${message}` }, { status: 400 });
  }
}
