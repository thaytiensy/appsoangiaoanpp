import type { LessonInput, LessonPlanOutput } from '../contracts/app.schema';
import { getSlideImageUrl } from './slide-image-service';
import { normalizeNfc } from './text-normalizer';

export function generatePedagogicalPlan(input: LessonInput): LessonPlanOutput {
  const isElementary = input.grade <= 5;
  const standardDoc = isElementary ? 'CÔNG VĂN 2345/BGDĐT-GDTH' : 'CÔNG VĂN 5512/BGDĐT-GDTrH';
  const act1Name = isElementary ? 'Hoạt động 1: Khởi động (Kết nối bài học)' : 'Hoạt động 1: Mở đầu / Khởi động';
  const act2Name = isElementary ? 'Hoạt động 2: Khám phá (Hình thành kiến thức mới)' : 'Hoạt động 2: Hình thành kiến thức mới';
  const act3Name = isElementary ? 'Hoạt động 3: Luyện tập, thực hành' : 'Hoạt động 3: Luyện tập & Củng cố';
  const act4Name = isElementary ? 'Hoạt động 4: Vận dụng, trải nghiệm' : 'Hoạt động 4: Vận dụng & Mở rộng';

  const cleanTopic = normalizeNfc(input.topic);
  const cleanSubject = normalizeNfc(input.subject);

  const rawSlides = [
    {
      slideNumber: 1,
      title: `${cleanTopic.toUpperCase()}`,
      bulletPoints: [
        `Môn: ${cleanSubject} - Khối: Lớp ${input.grade}`,
        `Bộ sách: ${input.textbook}`,
        `Giáo viên giảng dạy: ${input.teacherName}`,
        `Đơn vị: ${input.schoolName}`,
      ],
      visualNote: `Hình ảnh minh họa chân thực chủ đề ${cleanTopic}, phong cách sư phạm chuẩn 16:9.`,
      speakerNotes: `Chào mừng toàn thể quý Thầy Cô và các em học sinh đến với tiết học ${cleanSubject} hôm nay.`,
    },
    {
      slideNumber: 2,
      title: 'MỤC TIÊU BÀI HỌC',
      bulletPoints: [
        `Kiến thức: Làm chủ kiến thức trọng tâm bài học "${cleanTopic}"`,
        `Năng lực: Rèn luyện năng lực tự chủ, giải quyết vấn đề và hợp tác nhóm`,
        `Phẩm chất: Bồi dưỡng tinh thần trách nhiệm, yêu thích khám phá và chăm chỉ`,
      ],
      visualNote: 'Sơ đồ mục tiêu 3 thành phần: Kiến thức, Năng lực và Phẩm chất.',
      speakerNotes: `Trong bài học này, chúng ta sẽ cùng nhau thực hiện 3 mục tiêu cốt lõi sau.`,
    },
    {
      slideNumber: 3,
      title: `${act1Name.toUpperCase()}`,
      bulletPoints: [
        `Quan sát hình ảnh thực tiễn mở đầu bài học "${cleanTopic}"`,
        `Nêu cảm nhận và phát hiện tình huống cần giải quyết`,
        `Thảo luận nhanh cặp đôi trong thời gian 2 - 3 phút`,
      ],
      visualNote: `Hình ảnh tình huống gợi mở sinh động về ${cleanTopic}.`,
      speakerNotes: `Thầy/cô mời các em quan sát màn chiếu và suy nghĩ trả lời câu hỏi khởi động.`,
    },
    {
      slideNumber: 4,
      title: `${act2Name.toUpperCase()}`,
      bulletPoints: [
        `Khám phá nội dung trọng tâm và bản chất của "${cleanTopic}"`,
        `Thực hiện nhiệm vụ học tập trên Phiếu học tập số 1`,
        `Rút ra quy tắc, kết luận cốt lõi ghi nhớ vào vở`,
      ],
      visualNote: 'Bảng tổng hợp hoặc sơ đồ kiến thức cốt lõi.',
      speakerNotes: `Đây là phần trọng tâm của bài học, các nhóm tập trung thảo luận và hoàn thiện sản phẩm.`,
    },
    {
      slideNumber: 5,
      title: `${act3Name.toUpperCase()}`,
      bulletPoints: [
        `Vận dụng kiến thức giải quyết bài tập thực hành`,
        `Rèn luyện kỹ năng thực hành và thảo luận đối chiếu kết quả`,
        `Chỉnh sửa và lưu ý các điểm cần tránh khi làm bài`,
      ],
      visualNote: 'Khung bài tập thực hành chia các bước giải tiêu chuẩn.',
      speakerNotes: `Bây giờ các em sẽ thực hành vận dụng vào các bài tập theo phiếu học tập số 2.`,
    },
    {
      slideNumber: 6,
      title: `${act4Name.toUpperCase()}`,
      bulletPoints: [
        `Liên hệ thực tế đời sống xung quanh chủ đề "${cleanTopic}"`,
        `Thực hiện dự án nhỏ / bài tập sáng tạo tại gia đình`,
        `Chuẩn bị dụng cụ và học liệu cho tiết học tiếp theo`,
      ],
      visualNote: 'Hình ảnh ứng dụng thực tế phong phú trong đời sống gia đình và xã hội.',
      speakerNotes: `Về nhà các em nhớ hoàn thành nhiệm vụ vận dụng và chia sẻ cùng người thân nhé.`,
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
        stepName: act1Name,
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
        stepName: act2Name,
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
        stepName: act3Name,
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
        stepName: act4Name,
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
