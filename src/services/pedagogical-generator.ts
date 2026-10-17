import type { LessonInput, LessonPlanOutput } from '../contracts/app.schema';

export function generatePedagogicalPlan(input: LessonInput): LessonPlanOutput {
  const isElementary = input.grade <= 5;
  const standardTitle = isElementary ? 'CÔNG VĂN 2345/BGDĐT-GDTH' : 'CÔNG VĂN 5512/BGDĐT-GDTrH';

  return {
    id: `lp_${Date.now()}`,
    metadata: input,
    objectives: {
      knowledge: `Học sinh nắm vững các khái niệm, quy tắc và bản chất cốt lõi của chủ đề "${input.topic}"; vận dụng thành thạo vào giải quyết các bài tập và tình huống học tập theo yêu cầu cần đạt của Chương trình GDPT 2018 bộ sách ${input.textbook}.`,
      coreCompetencies: `Năng lực tự chủ và tự học (tự giác tìm hiểu tài liệu SGK); Năng lực giao tiếp và hợp tác (thảo luận nhóm tích cực); Năng lực giải quyết vấn đề và sáng tạo (đề xuất cách làm mới).`,
      specificCompetencies: `Năng lực đặc thù bộ môn ${input.subject}: tư duy ngôn ngữ/toán học/khoa học, mô hình hóa tình huống thực tiễn, phân tích dữ liệu và trình bày logic sản phẩm học tập.`,
      qualities: `Chăm chỉ, trung thực trong học tập; tinh thần trách nhiệm trong làm việc nhóm; tình yêu khoa học và ý thức vận dụng tri thức vào đời sống.`,
    },
    materials: {
      teacherPreparation: `Kế hoạch bài dạy (${standardTitle}); Bài giảng điện tử PowerPoint 16:9; Phiếu học tập số 1, 2; Thiết bị dạy học và hình ảnh minh họa SGK ${input.textbook}.`,
      studentPreparation: `Sách giáo khoa ${input.subject} Lớp ${input.grade} (${input.textbook}); Vở ghi chép; Đồ dùng học tập; Đọc trước nội dung bài "${input.topic}".`,
    },
    activities: [
      {
        stepName: 'Hoạt động 1: Mở đầu / Khởi động',
        duration: '5 - 7 phút',
        objective: `Kích hoạt kiến thức nền tảng, tạo tâm thế hào hứng và nhu cầu nhận thức khám phá bài học "${input.topic}".`,
        content: `Giáo viên đưa ra tình huống thực tế / câu đố / trò chơi học tập liên quan đến nội dung "${input.topic}".`,
        product: `Câu trả lời của học sinh, sự hào hứng và tâm thế sẵn sàng tiếp nhận nhiệm vụ học tập mới.`,
        implementation: {
          transferTask: `GV trình chiếu Slide khởi động, nêu tình huống/câu hỏi gợi mở và phổ biến thể lệ thảo luận nhanh theo cặp.`,
          performTask: `HS quan sát, suy nghĩ cá nhân trong 1 phút, sau đó thảo luận nhanh cùng bạn bên cạnh để tìm câu trả lời.`,
          reportDiscuss: `GV mời đại diện 2 - 3 cặp HS trình bày câu trả lời; các học sinh khác lắng nghe, nhận xét và bổ sung ý kiến.`,
          concludeJudge: `GV nhận xét, tuyên dương các câu trả lời sáng tạo, khéo léo dẫn dắt kết nối trực tiếp vào bài mới: "${input.topic}".`,
        },
      },
      {
        stepName: 'Hoạt động 2: Hình thành kiến thức mới',
        duration: '20 - 25 phút',
        objective: `Học sinh chủ động khám phá, chiếm lĩnh định nghĩa, quy tắc và kiến thức trọng tâm của bài học.`,
        content: `Nghiên cứu tài liệu SGK ${input.textbook}, thực hiện các câu hỏi khám phá và hoàn thành Phiếu học tập số 1.`,
        product: `Nội dung hoàn chỉnh trên Phiếu học tập số 1, vở ghi cá nhân và phần trình bày bảng nhóm của học sinh.`,
        implementation: {
          transferTask: `GV chia lớp thành các nhóm (4 - 6 HS), phát Phiếu học tập số 1 và giao nhiệm vụ nghiên cứu SGK tìm hiểu các nội dung trọng tâm.`,
          performTask: `Các nhóm phân công nhiệm vụ, đọc tài liệu, trao đổi, phản biện và thống nhất ghi kết quả thảo luận vào bảng nhóm.`,
          reportDiscuss: `Đại diện 1 nhóm lên bảng trình bày kết quả; các nhóm khác đối chiếu, đặt câu hỏi phản biện và bổ sung.`,
          concludeJudge: `GV nhận xét quá trình làm việc của các nhóm, chính xác hóa kiến thức, chốt lại quy tắc/kết luận quan trọng để HS ghi vở.`,
        },
      },
      {
        stepName: 'Hoạt động 3: Luyện tập & Củng cố',
        duration: '8 - 10 phút',
        objective: `Học sinh củng cố kiến thức vừa học, rèn luyện kỹ năng thực hành giải các bài tập mẫu và bài tập phân hóa.`,
        content: `Hệ thống bài tập trắc nghiệm nhanh và bài tập tự luận cơ bản trong SGK ${input.textbook}.`,
        product: `Bài làm chính xác của học sinh trong vở bài tập, kết quả phản hồi trên bảng phụ hoặc thẻ trắc nghiệm.`,
        implementation: {
          transferTask: `GV giao hệ thống bài tập luyện tập từ dễ đến nâng cao, yêu cầu học sinh làm độc lập vào vở.`,
          performTask: `HS làm bài cá nhân; GV đi quan sát, hướng dẫn kịp thời cho những học sinh gặp khó khăn.`,
          reportDiscuss: `GV gọi học sinh lên bảng chữa bài, yêu cầu giải thích rõ các bước thực hiện; cả lớp theo dõi và nhận xét.`,
          concludeJudge: `GV chốt đáp án đúng, chỉ rõ các lỗi sai thường gặp cần tránh và tuyên dương các bài làm chuẩn xác.`,
        },
      },
      {
        stepName: 'Hoạt động 4: Vận dụng & Mở rộng',
        duration: '3 - 5 phút',
        objective: `Vận dụng kiến thức bài học để giải quyết vấn đề trong thực tế đời sống; phát triển tư duy sáng tạo.`,
        content: `Nhiệm vụ thực hành / dự án nhỏ vận dụng kiến thức "${input.topic}" vào cuộc sống gia đình và xã hội.`,
        product: `Sản phẩm tìm tòi, bài viết thu hoạch hoặc báo cáo ngắn gọn nộp vào tiết học tiếp theo.`,
        implementation: {
          transferTask: `GV giao nhiệm vụ vận dụng thực tế về nhà; hướng dẫn tiêu chí đánh giá sản phẩm và cách thức thu thập dữ liệu.`,
          performTask: `HS ghi chép nhiệm vụ vào vở, lập kế hoạch thực hiện tại nhà cùng sự hỗ trợ của người thân hoặc nhóm bạn.`,
          reportDiscuss: `HS sẽ nộp sản phẩm hoặc báo cáo ngắn gọn vào đầu tiết học tiếp theo.`,
          concludeJudge: `GV dặn dò học sinh chuẩn bị bài học mới, hướng dẫn tài liệu đọc thêm trên trang học liệu điện tử.`,
        },
      },
    ],
    slides: [
      {
        slideNumber: 1,
        title: `${input.topic.toUpperCase()}`,
        bulletPoints: [
          `Môn: ${input.subject} - Khối: Lớp ${input.grade}`,
          `Bộ sách: ${input.textbook}`,
          `Giáo viên giảng dạy: ${input.teacherName}`,
          `Đơn vị: ${input.schoolName}`,
        ],
        visualNote: `Hình nền nhận diện thương hiệu bộ sách ${input.textbook}, biểu trưng môn ${input.subject}, thiết kế hiện đại 16:9.`,
        speakerNotes: `Chào mừng toàn thể quý Thầy Cô và các em học sinh đến với tiết học ${input.subject} hôm nay.`,
      },
      {
        slideNumber: 2,
        title: 'MỤC TIÊU BÀI HỌC',
        bulletPoints: [
          `Kiến thức: Nắm vững cốt lõi bài học "${input.topic}"`,
          `Năng lực: Rèn luyện năng lực tự học, hợp tác và giải quyết vấn đề`,
          `Phẩm chất: Phát triển tính chăm chỉ, trách nhiệm và tư duy khoa học`,
        ],
        visualNote: `Sơ đồ hình phễu hoặc 3 khối thẻ màu sắc tương phản nổi bật.`,
        speakerNotes: `Trong bài học này, chúng ta sẽ cùng nhau hoàn thành 3 mục tiêu trọng tâm sau đây.`,
      },
      {
        slideNumber: 3,
        title: '1. KHỞI ĐỘNG: KHÁM PHÁ TÌNH HUỐNG',
        bulletPoints: [
          `Tình huống thực tế dẫn nhập vào bài mới`,
          `Câu hỏi gợi mở: Quan sát và tìm mối liên hệ`,
          `Thời gian suy nghĩ và trao đổi cặp: 2 phút`,
        ],
        visualNote: `Hình ảnh minh họa tình huống sinh động, câu hỏi đặt trong khung hội thoại nổi bật.`,
        speakerNotes: `Các em hãy cùng quan sát hình ảnh trên màn chiếu và suy nghĩ giải quyết tình huống sau.`,
      },
      {
        slideNumber: 4,
        title: '2. HÌNH THÀNH KIẾN THỨC MỚI',
        bulletPoints: [
          `Khái niệm và quy tắc trọng tâm của "${input.topic}"`,
          `Ví dụ minh họa chi tiết và các trường hợp đặc biệt`,
          `Ghi nhớ cốt lõi theo SGK ${input.textbook}`,
        ],
        visualNote: `Bảng so sánh 2 cột hoặc khối hộp công thức/quy tắc được viền sáng.`,
        speakerNotes: `Đây là nội dung cốt lõi của bài học, thầy/cô mời các em chú ý theo dõi các bước chứng minh.`,
      },
      {
        slideNumber: 5,
        title: '3. LUYỆN TẬP & BÀI TẬP THỰC HÀNH',
        bulletPoints: [
          `Bài tập 1: Bài tập nhận biết và củng cố nhanh`,
          `Bài tập 2: Vận dụng quy tắc giải quyết bài toán tiêu chuẩn`,
          `Lưu ý các lỗi sai thường gặp khi làm bài`,
        ],
        visualNote: `Khung bài tập chia 2 cột Đề bài và Gợi ý các bước giải quyết.`,
        speakerNotes: `Bây giờ chúng ta sẽ cùng áp dụng kiến thức vừa học vào làm các bài tập sau vào vở.`,
      },
      {
        slideNumber: 6,
        title: '4. VẬN DỤNG & DẶN DÒ VỀ NHÀ',
        bulletPoints: [
          `Nhiệm vụ thực tế liên hệ kiến thức với đời sống hàng ngày`,
          `Ôn tập lại các nội dung đã học trong bài`,
          `Đọc và chuẩn bị trước nội dung bài học tiết sau`,
        ],
        visualNote: `Icon ngôi sao thành tích, đồng hồ nhắc nhở và hình ảnh ứng dụng thực tế.`,
        speakerNotes: `Bài học hôm nay khép lại tại đây, các em nhớ hoàn thành nhiệm vụ vận dụng tại nhà.`,
      },
    ],
    createdAt: new Date().toISOString(),
  };
}
