import type { LessonInput, LessonPlanOutput } from '../contracts/app.schema';
import { getSlideImageUrl } from './slide-image-service';
import { normalizeNfc } from './text-normalizer';

export function generatePedagogicalPlan(input: LessonInput): LessonPlanOutput {
  const isElementary = input.grade <= 5;
  const standardDoc = isElementary ? 'CÔNG VĂN 2345/BGDĐT-GDTH' : 'CÔNG VĂN 5512/BGDĐT-GDTrH';
  const act1 = isElementary ? 'Hoạt động 1: Khởi động (Kết nối bài học)' : 'Hoạt động 1: Mở đầu / Khởi động';
  const act2 = isElementary ? 'Hoạt động 2: Khám phá (Hình thành kiến thức mới)' : 'Hoạt động 2: Hình thành kiến thức mới';
  const act3 = isElementary ? 'Hoạt động 3: Luyện tập, thực hành' : 'Hoạt động 3: Luyện tập & Củng cố';
  const act4 = isElementary ? 'Hoạt động 4: Vận dụng, trải nghiệm' : 'Hoạt động 4: Vận dụng & Mở rộng';

  const cleanTopic = normalizeNfc(input.topic) || 'Bài học GDPT';
  const cleanSubject = normalizeNfc(input.subject) || 'Môn học';

  const rawSlides = [
    {
      slideNumber: 1,
      title: `${cleanTopic.toUpperCase()}`,
      bulletPoints: [
        'CHÀO MỪNG QUÝ THẦY CÔ VÀ CÁC EM HỌC SINH THAM DỰ TIẾT HỌC!',
        `Môn: ${cleanSubject} - Khối: Lớp ${input.grade} | Bộ sách: ${input.textbook}`,
        `Giáo viên giảng dạy: ${input.teacherName || 'Giáo viên bộ môn'}`,
        `Đơn vị công tác: ${input.schoolName || 'Nhà trường'}`,
      ],
      visualNote: `Hình ảnh minh họa chân thực chủ đề ${cleanTopic}, phong cách sư phạm chuẩn 16:9.`,
      speakerNotes: `Kính chào quý Thầy Cô giáo và toàn thể các em học sinh! Chúc các em có một tiết học tràn đầy hứng khởi và sáng tạo.`,
    },
    {
      slideNumber: 2,
      title: 'MỤC TIÊU TIẾT HỌC CẦN ĐẠT',
      bulletPoints: [
        `Kiến thức: Nắm vững và làm chủ các khái niệm, quy tắc trọng tâm của "${cleanTopic}".`,
        'Năng lực: Rèn luyện năng lực tự chủ, giải quyết vấn đề, tư duy logic và làm việc nhóm.',
        'Phẩm chất: Bồi dưỡng tinh thần trách nhiệm, tính chăm chỉ và niềm đam mê khám phá.',
      ],
      visualNote: 'Sơ đồ mục tiêu 3 thành phần: Kiến thức, Năng lực và Phẩm chất.',
      speakerNotes: 'Trong bài học này, thầy/cô mong muốn tất cả các em sẽ cùng nhau hoàn thành xuất sắc 3 mục tiêu trọng tâm trên.',
    },
    {
      slideNumber: 3,
      title: `${act1.toUpperCase()}`,
      bulletPoints: [
        `Quan sát hình ảnh / tình huống thực tế dẫn nhập vào bài "${cleanTopic}".`,
        'Thảo luận nhanh cặp đôi: Nêu cảm nhận và phát hiện vấn đề cần giải quyết.',
        'Thời gian suy nghĩ và trao đổi: 2 - 3 phút.',
      ],
      visualNote: `Hình ảnh tình huống mở đầu gợi mở sinh động về ${cleanTopic}.`,
      speakerNotes: 'Thầy/cô mời các em quan sát màn chiếu, cùng suy nghĩ và giải đáp câu đố khởi động thú vị này.',
    },
    {
      slideNumber: 4,
      title: `${act2.toUpperCase()}`,
      bulletPoints: [
        `Khám phá nội dung lý thuyết then chốt và bản chất của "${cleanTopic}".`,
        'Nghiên cứu tài liệu SGK Kết nối tri thức và hoàn thành Phiếu học tập số 1.',
        'Đại diện các nhóm báo cáo kết quả và thảo luận nhận định.',
      ],
      visualNote: 'Sơ đồ tư duy hoặc bảng so sánh khái niệm cốt lõi.',
      speakerNotes: 'Đây là nội dung then chốt của bài học, các nhóm hãy tập trung làm việc để tìm ra kiến thức cốt lõi.',
    },
    {
      slideNumber: 5,
      title: 'PHÂN TÍCH CHI TIẾT & VÍ DỤ MINH HỌA',
      bulletPoints: [
        `Phân tích các ví dụ tiêu biểu liên quan trực tiếp đến "${cleanTopic}".`,
        'Các bước thực hiện bài bản và phương pháp tư duy chuẩn mực.',
        'Lưu ý các trường hợp đặc biệt và những lỗi sai học sinh thường gặp.',
      ],
      visualNote: 'Bảng quy tắc mẫu và các bước giải quyết bài toán tiêu chuẩn.',
      speakerNotes: 'Hãy chú ý lên màn chiếu, thầy/cô sẽ hướng dẫn chi tiết từng bước giải quyết ví dụ mẫu này.',
    },
    {
      slideNumber: 6,
      title: `${act3.toUpperCase()}`,
      bulletPoints: [
        'Học sinh thực hành làm các bài tập nhận biết và củng cố nhanh.',
        'Vận dụng giải bài tập tình huống nâng cao và đổi chéo vở kiểm tra.',
        'Giáo viên nhận xét, sửa bài chi tiết và chuẩn hóa đáp án.',
      ],
      visualNote: 'Khung bài tập thực hành chia 2 cột Đề bài và Hướng dẫn.',
      speakerNotes: 'Bây giờ các em sẽ có 7 phút làm bài vào vở, sau đó thầy/cô sẽ mời đại diện lên bảng chữa bài.',
    },
    {
      slideNumber: 7,
      title: `${act4.toUpperCase()}`,
      bulletPoints: [
        `Liên hệ kiến thức bài học "${cleanTopic}" vào thực tiễn đời sống hàng ngày.`,
        'Thực hiện dự án nhỏ / bài tập sáng tạo ứng dụng tại gia đình.',
        'Chuẩn bị dụng cụ và đọc trước bài học cho tiết học tiếp theo.',
      ],
      visualNote: 'Hình ảnh ứng dụng thực tế phong phú trong đời sống gia đình và xã hội.',
      speakerNotes: 'Kiến thức hôm nay rất gần gũi với cuộc sống. Về nhà các em hãy vận dụng và chia sẻ cùng người thân nhé.',
    },
    {
      slideNumber: 8,
      title: 'CHÂN THÀNH CẢM ƠN QUÝ THẦY CÔ VÀ CÁC EM!',
      bulletPoints: [
        'Trân trọng cảm ơn quý Thầy Cô đã dành thời gian về tham dự giờ dạy.',
        'Biểu dương tinh thần học tập tích cực, sôi nổi và sáng tạo của cả lớp.',
        'Dặn dò: Ôn tập kỹ bài học, hoàn thành bài tập về nhà và chuẩn bị bài mới.',
        'Kính chúc quý Thầy Cô nhiều sức khỏe - Chúc các em học sinh chăm ngoan, học giỏi!',
      ],
      visualNote: 'Hình ảnh hoa tươi rực rỡ, thông điệp tri ân và lời chúc tốt đẹp.',
      speakerNotes: 'Tiết học của chúng ta đến đây xin được khép lại. Chân thành cảm ơn quý Thầy Cô và các em học sinh. Hẹn gặp lại các em!',
    },
  ];

  const slides = rawSlides.map((s) => ({
    ...s,
    title: normalizeNfc(s.title),
    bulletPoints: s.bulletPoints.map((bp) => normalizeNfc(bp)),
    visualNote: normalizeNfc(s.visualNote),
    speakerNotes: normalizeNfc(s.speakerNotes),
    imageUrl: getSlideImageUrl({
      subject: cleanSubject,
      topic: cleanTopic,
      slideTitle: s.title,
      slideNumber: s.slideNumber,
    }),
  }));

  return {
    id: `lp_${Date.now()}`,
    metadata: {
      ...input,
      topic: cleanTopic,
      subject: cleanSubject,
    },
    objectives: {
      knowledge: normalizeNfc(`Học sinh nắm vững các khái niệm, quy tắc và bản chất cốt lõi của chủ đề "${cleanTopic}"; vận dụng thành thạo vào giải quyết các bài tập và tình huống học tập theo yêu cầu cần đạt của Chương trình GDPT 2018 bộ sách ${input.textbook}.`),
      coreCompetencies: normalizeNfc(`Năng lực tự chủ và tự học (tự giác tìm hiểu tài liệu SGK); Năng lực giao tiếp và hợp tác (thảo luận nhóm tích cực); Năng lực giải quyết vấn đề và sáng tạo (đề xuất cách làm mới).`),
      specificCompetencies: normalizeNfc(`Năng lực đặc thù bộ môn ${cleanSubject}: tư duy môn học, mô hình hóa tình huống thực tiễn, phân tích dữ liệu và trình bày logic sản phẩm học tập.`),
      qualities: normalizeNfc(`Chăm chỉ, trung thực trong học tập; tinh thần trách nhiệm trong làm việc nhóm; tình yêu khoa học và ý thức vận dụng tri thức vào đời sống.`),
    },
    materials: {
      teacherPreparation: normalizeNfc(`Kế hoạch bài dạy (${standardDoc}); Bài giảng điện tử PowerPoint 16:9; Phiếu học tập số 1, 2; Thiết bị dạy học và hình ảnh minh họa SGK ${input.textbook}.`),
      studentPreparation: normalizeNfc(`Sách giáo khoa ${cleanSubject} Lớp ${input.grade} (${input.textbook}); Vở ghi chép; Đồ dùng học tập; Đọc trước nội dung bài "${cleanTopic}".`),
    },
    activities: [
      {
        stepName: act1,
        duration: '5 - 7 phút',
        objective: normalizeNfc(`Kích hoạt kiến thức nền tảng, tạo tâm thế hào hứng và nhu cầu nhận thức khám phá bài học "${cleanTopic}".`),
        content: normalizeNfc(`Giáo viên đưa ra tình huống thực tế / trò chơi học tập liên quan đến nội dung "${cleanTopic}".`),
        product: normalizeNfc(`Câu trả lời của học sinh, sự hào hứng và tâm thế sẵn sàng tiếp nhận nhiệm vụ học tập mới.`),
        implementation: {
          transferTask: normalizeNfc(`GV trình chiếu Slide khởi động, nêu tình huống/câu hỏi gợi mở và phổ biến thể lệ thảo luận nhanh theo cặp.`),
          performTask: normalizeNfc(`HS quan sát, suy nghĩ cá nhân trong 1 phút, sau đó thảo luận nhanh cùng bạn bên cạnh để tìm câu trả lời.`),
          reportDiscuss: normalizeNfc(`GV mời đại diện 2 - 3 cặp HS trình bày câu trả lời; các học sinh khác lắng nghe, nhận xét và bổ sung ý kiến.`),
          concludeJudge: normalizeNfc(`GV nhận xét, tuyên dương các câu trả lời sáng tạo, khéo léo dẫn dắt kết nối trực tiếp vào bài mới: "${cleanTopic}".`),
        },
      },
      {
        stepName: act2,
        duration: '20 - 25 phút',
        objective: normalizeNfc(`Học sinh chủ động khám phá, chiếm lĩnh định nghĩa, quy tắc và kiến thức trọng tâm của bài học.`),
        content: normalizeNfc(`Nghiên cứu tài liệu SGK ${input.textbook}, thực hiện các câu hỏi khám phá và hoàn thành Phiếu học tập số 1.`),
        product: normalizeNfc(`Nội dung hoàn chỉnh trên Phiếu học tập số 1, vở ghi cá nhân và phần trình bày bảng nhóm của học sinh.`),
        implementation: {
          transferTask: normalizeNfc(`GV chia lớp thành các nhóm (4 - 6 HS), phát Phiếu học tập số 1 và giao nhiệm vụ nghiên cứu SGK tìm hiểu các nội dung trọng tâm.`),
          performTask: normalizeNfc(`Các nhóm phân công nhiệm vụ, đọc tài liệu, trao đổi, phản biện và thống nhất ghi kết quả thảo luận vào bảng nhóm.`),
          reportDiscuss: normalizeNfc(`Đại diện 1 nhóm lên bảng trình bày kết quả; các nhóm khác đối chiếu, đặt câu hỏi phản biện và bổ sung.`),
          concludeJudge: normalizeNfc(`GV nhận xét quá trình làm việc của các nhóm, chính xác hóa kiến thức, chốt lại quy tắc/kết luận quan trọng để HS ghi vở.`),
        },
      },
      {
        stepName: act3,
        duration: '8 - 10 phút',
        objective: normalizeNfc(`Học sinh củng cố kiến thức vừa học, rèn luyện kỹ năng thực hành giải các bài tập mẫu và bài tập phân hóa.`),
        content: normalizeNfc(`Hệ thống bài tập trắc nghiệm nhanh và bài tập tự luận cơ bản trong SGK ${input.textbook}.`),
        product: normalizeNfc(`Bài làm chính xác của học sinh trong vở bài tập, kết quả phản hồi trên bảng phụ hoặc thẻ trắc nghiệm.`),
        implementation: {
          transferTask: normalizeNfc(`GV giao hệ thống bài tập luyện tập từ dễ đến nâng cao, yêu cầu học sinh làm độc lập vào vở.`),
          performTask: normalizeNfc(`HS làm bài cá nhân; GV đi quan sát, hướng dẫn kịp thời cho những học sinh gặp khó khăn.`),
          reportDiscuss: normalizeNfc(`GV gọi học sinh lên bảng chữa bài, yêu cầu giải thích rõ các bước thực hiện; cả lớp theo dõi và nhận xét.`),
          concludeJudge: normalizeNfc(`GV chốt đáp án đúng, chỉ rõ các lỗi sai thường gặp cần tránh và tuyên dương các bài làm chuẩn xác.`),
        },
      },
      {
        stepName: act4,
        duration: '3 - 5 phút',
        objective: normalizeNfc(`Vận dụng kiến thức bài học để giải quyết vấn đề trong thực tế đời sống; phát triển tư duy sáng tạo.`),
        content: normalizeNfc(`Nhiệm vụ thực hành / dự án nhỏ vận dụng kiến thức "${cleanTopic}" vào cuộc sống gia đình và xã hội.`),
        product: normalizeNfc(`Sản phẩm tìm tòi, bài viết thu hoạch hoặc báo cáo ngắn gọn nộp vào tiết học tiếp theo.`),
        implementation: {
          transferTask: normalizeNfc(`GV giao nhiệm vụ vận dụng thực tế về nhà; hướng dẫn tiêu chí đánh giá sản phẩm và cách thức thu thập dữ liệu.`),
          performTask: normalizeNfc(`HS ghi chép nhiệm vụ vào vở, lập kế hoạch thực hiện tại nhà cùng sự hỗ trợ của người thân hoặc nhóm bạn.`),
          reportDiscuss: normalizeNfc(`HS sẽ nộp sản phẩm hoặc báo cáo ngắn gọn vào đầu tiết học tiếp theo.`),
          concludeJudge: normalizeNfc(`GV dặn dò học sinh chuẩn bị bài học mới, hướng dẫn tài liệu đọc thêm trên trang học liệu điện tử.`),
        },
      },
    ],
    slides,
    createdAt: new Date().toISOString(),
  };
}
