import type { LessonPlanOutput, PedagogicalActivity, SlideItem } from '../contracts/app.schema';
import type { ParsedWordResult } from './word-parser';
import { convertParsedToLessonInput } from './word-parser';
import { getSlideImageUrl } from './slide-image-service';
import { normalizeNfc } from './text-normalizer';

export function buildPlanFromWord(parsed: ParsedWordResult): LessonPlanOutput {
  const metadata = convertParsedToLessonInput(parsed);

  const activities: PedagogicalActivity[] = [
    {
      stepName: 'Hoạt động 1: Mở đầu / Khởi động',
      duration: '5 - 7 phút',
      objective: 'Tạo tâm thế hứng thú học tập, kết nối kiến thức thực tế với bài học mới.',
      content: parsed.sections.activities[0] || 'Tổ chức trò chơi khởi động hoặc tình huống thực tiễn mở đầu bài học.',
      product: 'Câu trả lời nhanh, sự hứng khởi và định hướng tiếp cận bài học của học sinh.',
      implementation: {
        transferTask: 'Giáo viên nêu câu hỏi khởi động, trình chiếu slide bài toán thực tế.',
        performTask: 'Học sinh suy nghĩ cá nhân, thảo luận nhanh theo cặp đôi.',
        reportDiscuss: 'Đại diện 2 học sinh phát biểu, các bạn khác lắng nghe và nhận xét.',
        concludeJudge: 'Giáo viên nhận xét, dẫn dắt vào bài mới một cách tự nhiên.',
      },
    },
    {
      stepName: 'Hoạt động 2: Hình thành kiến thức mới',
      duration: '20 - 25 phút',
      objective: 'Học sinh tiếp thu khái niệm trọng tâm, quy tắc và phương pháp cốt lõi.',
      content: parsed.sections.activities[1] || 'Khám phá kiến thức cốt lõi thông qua ví dụ minh họa và hoạt động nhóm.',
      product: 'Ghi chép vở, phiếu học tập đã hoàn thành, định lý hoặc ghi nhớ cốt lõi.',
      implementation: {
        transferTask: 'Giáo viên giao phiếu học tập số 1, hướng dẫn học sinh đọc SGK và tài liệu.',
        performTask: 'Học sinh làm việc nhóm 4 bạn, thực hiện các yêu cầu trong phiếu.',
        reportDiscuss: 'Các nhóm treo sản phẩm lên bảng, nhóm đại diện thuyết trình kết quả.',
        concludeJudge: 'Giáo viên chốt kiến thức trọng tâm, ghi bảng và trình chiếu slide chuẩn hóa.',
      },
    },
    {
      stepName: 'Hoạt động 3: Luyện tập & Thực hành',
      duration: '10 - 12 phút',
      objective: 'Củng cố kiến thức vừa học, rèn luyện kỹ năng giải bài tập cơ bản và nâng cao.',
      content: parsed.sections.activities[2] || 'Giải các bài tập trong SGK Kết nối tri thức và câu hỏi trắc nghiệm nhanh.',
      product: 'Lời giải bài tập trong vở, đáp án trắc nghiệm hoặc bảng phụ của các tổ.',
      implementation: {
        transferTask: 'Giáo viên chiếu bài tập luyện tập trên slide, quy định thời gian hoàn thành.',
        performTask: 'Học sinh làm bài cá nhân vào vở, đổi chéo vở kiểm tra lẫn nhau.',
        reportDiscuss: '2 học sinh lên bảng giải, lớp quan sát nhận xét đối chiếu.',
        concludeJudge: 'Giáo viên chữa bài chi tiết, lưu ý các lỗi sai thường gặp cho cả lớp.',
      },
    },
    {
      stepName: 'Hoạt động 4: Vận dụng & Mở rộng',
      duration: '3 - 5 phút',
      objective: 'Ứng dụng kiến thức vào giải quyết vấn đề thực tế đời sống và dự án nhỏ.',
      content: parsed.sections.activities[3] || 'Nhiệm vụ liên hệ thực tế, tìm hiểu ứng dụng bài học trong đời sống.',
      product: 'Kế hoạch thực hiện bài tập thực tế tại nhà, báo cáo ngắn.',
      implementation: {
        transferTask: 'Giáo viên giao câu hỏi vận dụng thực tế và hướng dẫn tự học tại nhà.',
        performTask: 'Học sinh ghi nhận yêu cầu vào sổ tay học tập.',
        reportDiscuss: 'Học sinh thảo luận nhanh ý tưởng tiếp cận dự án nhỏ.',
        concludeJudge: 'Giáo viên dặn dò chuẩn bị cho tiết học tiếp theo.',
      },
    },
  ];

  const rawSlides: Omit<SlideItem, 'imageUrl'>[] = [
    {
      slideNumber: 1,
      title: `${metadata.topic}`,
      bulletPoints: [
        'CHÀO MỪNG QUÝ THẦY CÔ VÀ CÁC EM HỌC SINH THAM DỰ TIẾT HỌC!',
        `Môn học: ${metadata.subject} - Lớp ${metadata.grade} | Bộ sách: ${metadata.textbook}`,
        `Giáo viên: ${metadata.teacherName || 'Giáo viên bộ môn'}`,
        `Đơn vị: ${metadata.schoolName || 'Nhà trường'}`,
      ],
      visualNote: 'Hình ảnh bìa minh họa sống động liên quan đến chủ đề bài dạy',
      speakerNotes: `Chào mừng quý thầy cô và các em học sinh đến với tiết học ${metadata.topic}.`,
    },
    {
      slideNumber: 2,
      title: 'Mục Tiêu Tiết Học Cần Đạt',
      bulletPoints: [
        `Kiến thức: ${parsed.sections.objectives.slice(0, 120)}...`,
        'Năng lực: Rèn luyện năng lực tự chủ, giải quyết vấn đề và giao tiếp hợp tác.',
        'Phẩm chất: Bồi dưỡng tính chăm chỉ, trách nhiệm và trung thực trong học tập.',
      ],
      visualNote: 'Icon 3 mục tiêu: Trí tuệ (Kiến thức) - Bàn tay (Năng lực) - Trái tim (Phẩm chất)',
      speakerNotes: 'Thầy mong muốn sau tiết học này, tất cả các em đều làm chủ được các kiến thức cốt lõi.',
    },
    {
      slideNumber: 3,
      title: 'Hoạt Động 1: Khởi Động Hứng Thú',
      bulletPoints: [
        'Tham gia câu hỏi khởi động kích thích tư duy.',
        'Quan sát tình huống thực tiễn mở đầu bài học.',
        'Liên hệ trải nghiệm thực tế với vấn đề mới.',
      ],
      visualNote: 'Hình ảnh câu hỏi đố vui hoặc câu chuyện thực tiễn gây tò mò',
      speakerNotes: 'Trước khi vào bài, thầy có một tình huống thú vị dành cho cả lớp.',
    },
    {
      slideNumber: 4,
      title: 'Hoạt Động 2: Kiến Thức Trọng Tâm',
      bulletPoints: [
        'Nghiên cứu khái niệm và quy tắc bài học.',
        'Thực hiện phiếu học tập cá nhân & theo nhóm.',
        'Rút ra kết luận và ghi chép kiến thức cốt lõi.',
      ],
      visualNote: 'Sơ đồ tư duy tóm tắt cấu trúc lý thuyết hoặc bảng so sánh',
      speakerNotes: 'Hãy tập trung vào sơ đồ này, đây là chìa khóa then chốt của bài học.',
    },
    {
      slideNumber: 5,
      title: 'Phân Tích Chi Tiết & Ví Dụ Minh Họa',
      bulletPoints: [
        'Phân tích chi tiết ví dụ điển hình của bài học.',
        'Hướng dẫn các bước giải quyết bài toán tiêu chuẩn.',
        'Lưu ý các sai sót học sinh thường mắc phải.',
      ],
      visualNote: 'Bảng quy tắc mẫu và các bước thực hành rõ ràng',
      speakerNotes: 'Thầy sẽ cùng các em phân tích chi tiết ví dụ mẫu này.',
    },
    {
      slideNumber: 6,
      title: 'Hoạt Động 3: Luyện Tập & Thực Hành',
      bulletPoints: [
        'Vận dụng công thức/kiến thức để giải bài tập.',
        'Luyện tập theo cặp đôi và đối chiếu đáp án.',
        'Khắc phục các lỗi sai thường gặp khi làm bài.',
      ],
      visualNote: 'Bảng tóm tắt bài tập mẫu và các bước giải tiêu chuẩn',
      speakerNotes: 'Các em có 7 phút làm bài vào vở, sau đó thầy gọi 2 bạn lên bảng.',
    },
    {
      slideNumber: 7,
      title: 'Hoạt Động 4: Vận Dụng & Dặn Dò',
      bulletPoints: [
        'Ứng dụng kiến thức vào tình huống thực tế cuộc sống.',
        'Ôn tập lại các nội dung chính vừa học.',
        'Hoàn thành bài tập về nhà và chuẩn bị bài mới.',
      ],
      visualNote: 'Hình ảnh ứng dụng thực tế phong phú và danh sách nhiệm vụ về nhà',
      speakerNotes: 'Về nhà các em nhớ hoàn thiện bài tập và chuẩn bị kỹ bài cho tiết sau nhé.',
    },
    {
      slideNumber: 8,
      title: 'CHÂN THÀNH CẢM ƠN QUÝ THẦY CÔ VÀ CÁC EM!',
      bulletPoints: [
        'Trân trọng cảm ơn quý Thầy Cô đã dành thời gian về tham dự giờ dạy.',
        'Biểu dương tinh thần học tập tích cực, sáng tạo của cả lớp.',
        'Dặn dò: Ôn tập kỹ bài học, hoàn thành bài tập về nhà và đọc trước bài mới.',
        'Kính chúc quý Thầy Cô nhiều sức khỏe - Chúc các em luôn chăm ngoan, học giỏi!',
      ],
      visualNote: 'Hình ảnh hoa tươi rực rỡ, thông điệp tri ân và lời chúc tốt đẹp.',
      speakerNotes: 'Tiết học của chúng ta đến đây xin được khép lại. Chân thành cảm ơn quý Thầy Cô và các em học sinh. Hẹn gặp lại các em!',
    },
  ];

  const slides: SlideItem[] = rawSlides.map((s) => ({
    ...s,
    title: normalizeNfc(s.title),
    bulletPoints: s.bulletPoints.map((bp) => normalizeNfc(bp)),
    visualNote: normalizeNfc(s.visualNote),
    speakerNotes: normalizeNfc(s.speakerNotes),
    imageUrl: getSlideImageUrl({
      subject: metadata.subject,
      topic: metadata.topic,
      slideTitle: s.title,
      slideNumber: s.slideNumber,
    }),
  }));

  return {
    id: `plan-word-${Date.now()}`,
    metadata,
    objectives: {
      knowledge: normalizeNfc(parsed.sections.objectives),
      coreCompetencies: normalizeNfc('Năng lực tự chủ và tự học, năng lực giao tiếp và hợp tác, năng lực giải quyết vấn đề.'),
      specificCompetencies: normalizeNfc(`Năng lực đặc thù môn ${metadata.subject} theo chuẩn GDPT 2018.`),
      qualities: normalizeNfc('Chăm chỉ, trung thực, trách nhiệm và say mê tìm tòi sáng tạo.'),
    },
    materials: {
      teacherPreparation: normalizeNfc(parsed.sections.materials),
      studentPreparation: normalizeNfc('Sách giáo khoa Kết nối tri thức, vở ghi, đồ dùng học tập đầy đủ.'),
    },
    activities,
    slides,
    generatedBy: 'Bóc Tách Giáo Án Word (.docx)',
    createdAt: new Date().toISOString(),
  };
}
