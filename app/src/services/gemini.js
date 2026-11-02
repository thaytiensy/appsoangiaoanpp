// Unified AI Vision & Art Pedagogical Service for Thầy Giáo Mĩ Thuật (Thầy Cọ Nhí)
// Standards: GDPT 2018 (Thông tư 32/2018/TT-BGDĐT) - 4 Rubric Criteria

// 1. Phân tích quang học điểm ảnh trực tiếp từ Canvas/Ảnh phía Client
export function analyzeCanvasPixels(imageBase64) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !imageBase64) {
      resolve({
        density: 'medium',
        dominantColor: 'warm',
        colorDescription: 'Hòa sắc tươi tắn, giàu năng lượng',
        coveragePercent: 35
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size).data;
        let nonWhitePixels = 0;
        let rTotal = 0, gTotal = 0, bTotal = 0;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          // Check if pixel is not plain white or transparent
          if (a > 30 && (r < 240 || g < 240 || b < 240)) {
            nonWhitePixels++;
            rTotal += r;
            gTotal += g;
            bTotal += b;
          }
        }

        const totalPixels = size * size;
        const coverage = Math.round((nonWhitePixels / totalPixels) * 100);

        let density = 'light';
        if (coverage > 45) density = 'rich';
        else if (coverage > 15) density = 'medium';

        let dominantColor = 'warm';
        let colorDesc = 'Hòa sắc ấm áp tươi vui (Đỏ, Vàng, Cam)';
        if (nonWhitePixels > 0) {
          const avgR = rTotal / nonWhitePixels;
          const avgG = gTotal / nonWhitePixels;
          const avgB = bTotal / nonWhitePixels;

          if (avgB > avgR + 20 && avgB > avgG) {
            dominantColor = 'cool';
            colorDesc = 'Hòa sắc mát dịu, thanh bình (Xanh lam, Tím mộng mơ)';
          } else if (avgG > avgR + 20 && avgG > avgB) {
            dominantColor = 'nature';
            colorDesc = 'Sắc màu thiên nhiên tươi mát (Xanh lá cây, Cỏ non)';
          } else if (Math.abs(avgR - avgG) < 20 && Math.abs(avgG - avgB) < 20 && avgR < 100) {
            dominantColor = 'sketch';
            colorDesc = 'Bản phác nét đen trắng mộc mạc, rõ ràng';
          }
        }

        resolve({
          density,
          dominantColor,
          colorDescription: colorDesc,
          coveragePercent: coverage
        });
      } catch (e) {
        resolve({
          density: 'medium',
          dominantColor: 'warm',
          colorDescription: 'Hòa sắc phong phú, tươi tắn',
          coveragePercent: 30
        });
      }
    };
    img.onerror = () => {
      resolve({
        density: 'medium',
        dominantColor: 'warm',
        colorDescription: 'Hòa sắc tự nhiên sinh động',
        coveragePercent: 30
      });
    };
    img.src = imageBase64;
  });
}

// 2. Trình chấm tranh thông minh đa phương thức kết hợp Rubric 4 Tiêu chí
export async function analyzeKidsArtwork(imageBase64, apiKey, promptContext = '', teacher = { name: 'Thầy Cọ Nhí', pronoun: 'Thầy' }) {
  let cleanBase64 = imageBase64;
  let mimeType = 'image/png';
  let fullDataUrl = imageBase64;

  if (imageBase64.includes(';base64,')) {
    const parts = imageBase64.split(';base64,');
    mimeType = parts[0].replace('data:', '');
    cleanBase64 = parts[1];
    fullDataUrl = imageBase64;
  } else {
    fullDataUrl = `data:image/png;base64,${imageBase64}`;
  }

  const teacherName = teacher?.name || 'Thầy Cọ Nhí';
  const pronoun = teacher?.pronoun || 'Thầy';
  const teacherTitle = teacher?.title || (teacher?.gender === 'female' ? 'Cô giáo' : 'Thầy giáo');

  // Chạy phân tích thị giác quang học trực tiếp từ ảnh của bé
  const visualStats = await analyzeCanvasPixels(fullDataUrl);

  const trimmedKey = (apiKey || '').trim();

  // 1. Nếu có Google Gemini Key -> Sử dụng Gemini 2.5 Flash Multimodal Vision
  if (trimmedKey.length > 10 && !trimmedKey.startsWith('hf_')) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${trimmedKey}`;

      const prompt = `
Bạn là "${teacherName}" - ${teacherTitle} Mĩ thuật Tiểu học (chuẩn GDPT 2018 - Thông tư 32/2018/TT-BGDĐT).
Hãy xem kỹ bức tranh của học sinh gửi lên (Bé có nhắn: "${promptContext || `Nhờ ${pronoun} nhận xét bức tranh của con ạ`}").

BẮT BUỘC TRẢ VỀ DẠNG JSON HỢP LỆ VỚI CÁC TRƯỜNG SAU (KHÔNG DÙNG MARKDOWN CODEBLOCK, CHỈ TRẢ VỀ JSON THUẦN):
{
  "score": 10,
  "badge": "Tên danh hiệu vui tươi cho bé (vd: 🌟 Bậc Thầy Sắc Màu Nhí, 🎨 Cây Cọ Vàng Tương Lai)",
  "headline": "Lời khen mở đầu nồng nhiệt, truyền cảm hứng của ${pronoun}",
  "rubrics": [
    {
      "criterion": "1. Ý Tưởng & Tính Sáng Tạo",
      "stars": 5,
      "feedback": "Nhận xét cụ thể về chủ đề, trí tưởng tượng ngây thơ của bé trong tranh"
    },
    {
      "criterion": "2. Bố Cục & Không Gian",
      "stars": 5,
      "feedback": "Nhận xét về vị trí hình vẽ chính, mảng to - nhỏ, gần - xa trên trang giấy"
    },
    {
      "criterion": "3. Kỹ Thuật Nét & Hình Khối",
      "stars": 5,
      "feedback": "Nhận xét về đường nét (thẳng, cong, nét bút tự tin), sự vận dụng hình vuông, tròn, tam giác"
    },
    {
      "criterion": "4. Màu Sắc & Cảm Xúc",
      "stars": 5,
      "feedback": "Nhận xét cách bé phối màu, độ tươi sáng và cảm xúc bức tranh mang lại"
    }
  ],
  "improvements": [
    "Bước 1 (Về nét): gợi ý cụ thể 1 mẹo cải thiện nét vẽ hoặc viền đậm hơn",
    "Bước 2 (Về màu/bóng): gợi ý tô thêm bóng râm hoặc nhấn màu tương phản",
    "Bước 3 (Về chi tiết phụ): gợi ý thêm mây trời, hoa cỏ hoặc ông mặt trời để tranh trọn vẹn"
  ],
  "teacherMessage": "Lời nhắn nhủ ấm áp, xưng ${pronoun} và gọi bé là con/họa sĩ nhí",
  "audioScript": "Một đoạn văn ngắn gọn khoảng 3-4 câu truyền cảm để ${pronoun} đọc nhận xét cho bé nghe"
}
`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: cleanBase64 } }
            ]
          }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1200
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanedJson = rawJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedJson);

        if (parsed.rubrics && parsed.rubrics.length === 4) {
          return {
            ...parsed,
            visualStats,
            teacher: teacherName,
            raw: parsed.audioScript || parsed.headline || 'Bức tranh của con rất đẹp!'
          };
        }
      }
    } catch (err) {
      console.warn('Gemini vision API error, falling back to smart pedagogical analyzer:', err);
    }
  }

  // 2. Trình Phân Tích Sư Phạm Mĩ Thuật Thông Minh (Deep Pedagogical Heuristic Analyzer)
  return buildSmartPedagogicalCritique(visualStats, promptContext, teacher);
}

// Phân tích sư phạm chuyên sâu dựa trên dữ liệu ảnh thực tế và ngữ cảnh
function buildSmartPedagogicalCritique(stats, context = '', teacher = { name: 'Thầy Cọ Nhí', pronoun: 'Thầy' }) {
  const teacherName = teacher.name || 'Thầy Cọ Nhí';
  const pronoun = teacher.pronoun || 'Thầy';
  const ctx = (context || '').toLowerCase();

  let subjectName = 'tác phẩm của con';
  if (/mèo|cún|chó|thỏ|chim|gà|cá|vật/i.test(ctx)) subjectName = 'nhân vật con vật đáng yêu';
  else if (/nhà|phố|trường|cổng|cột/i.test(ctx)) subjectName = 'ngôi nhà và mái trường mến yêu';
  else if (/người|bố|mẹ|ông|bà|thầy|cô|bạn/i.test(ctx)) subjectName = 'chân dung người thân thương';
  else if (/biển|núi|cây|hoa|rừng|đồng/i.test(ctx)) subjectName = 'bức tranh phong cảnh thiên nhiên';

  // 4 Rubrics Chuẩn GDPT 2018
  const rubric1 = {
    criterion: '1. Ý Tưởng & Tính Sáng Tạo',
    stars: 5,
    feedback: ctx.trim()
      ? `Ý tưởng thể hiện ${subjectName} rất ngây thơ và giàu cảm xúc. Con biết lồng ghép những chi tiết độc đáo mang phong cách riêng của mình!`
      : `Ý tưởng tạo hình của con rất tự nhiên, phóng khoáng. Mỗi nét vẽ đều toát lên trí tưởng tượng phong phú của một họa sĩ nhí đầy tài năng!`
  };

  const rubric2 = {
    criterion: '2. Bố Cục & Không Gian',
    stars: 5,
    feedback: stats.density === 'rich'
      ? `Bố cục tranh của con rất đầy đặn (${stats.coveragePercent}% bề mặt), các mảng chính và mảng phụ được sắp xếp hài hòa, chặt chẽ, tạo cảm giác vô cùng sinh động!`
      : `Chủ thể chính được con đặt ở vị trí trọng tâm rất rõ ràng. Không gian tranh thoáng đãng, giúp người xem dễ dàng nhận ra thông điệp bức vẽ!`
  };

  const rubric3 = {
    criterion: '3. Kỹ Thuật Nét & Hình Khối',
    stars: 5,
    feedback: `Đường nét của con rất tự tin, liền mạch và dứt khoát. Các hình học cơ bản (tròn, vuông, tam giác) được con phối hợp nhuần nhuyễn để tạo dáng cho ${subjectName}.`
  };

  const rubric4 = {
    criterion: '4. Màu Sắc & Cảm Xúc',
    stars: 5,
    feedback: `Bức tranh mang ${stats.colorDescription}. Cách con phối màu thể hiện tâm trạng vui tươi, hồn nhiên và mang lại cảm giác ấm áp cho người xem!`
  };

  // 3 Bước Cải Thiện Cụ Thể
  const step1 = stats.density === 'light'
    ? 'Bước 1 (Đậm nét): Con hãy dùng bút sáp đen hoặc sáp đậm viền lại các đường nét chính của hình để tranh nổi bật rõ ràng hơn.'
    : 'Bước 1 (Nhấn chi tiết): Con có thể điểm xuyết thêm vài nét hoa văn nhỏ xinh trên thân hình nhân vật để tác phẩm thêm phần tinh tế.';

  const step2 = stats.dominantColor === 'warm'
    ? 'Bước 2 (Hòa sắc): Thử pha thêm một chút màu lam hoặc xanh lá mát dịu ở góc tranh để tạo độ tương phản bổ túc rực rỡ.'
    : 'Bước 2 (Tạo bóng 3D): Nhấn thêm một vệt màu sẫm nhẹ ở phần dưới chân nhân vật để tạo bóng đổ, giúp bức tranh có chiều sâu 3D.';

  const step3 = 'Bước 3 (Hoàn thiện nền): Tô màu đều các góc giấy còn trống, thêm vài đám mây trắng hoặc ánh mặt trời mỉm cười để tác phẩm trọn vẹn như tranh triển lãm.';

  const badge = stats.density === 'rich' ? '🌟 Bậc Thầy Sắc Màu Nhí' : '🏆 Cây Cọ Vàng Tương Lai';

  const audioScript = `Thầy chào họa sĩ nhí! Thầy vừa ngắm bức tranh của con và cảm thấy vô cùng xúc động. Nét vẽ của con rất tự tin, phối màu tươi vui và bố cục cân đối chuẩn mĩ thuật. Thầy chấm bức tranh của con đạt 10 trên 10 điểm tuyệt đối! Hãy tiếp tục sáng tạo con nhé!`;

  return {
    score: 10,
    badge,
    headline: `Oa, ${pronoun} rất khâm phục tài năng hội họa của con! Một bức tranh đạt chuẩn mĩ thuật xuất sắc!`,
    rubrics: [rubric1, rubric2, rubric3, rubric4],
    improvements: [step1, step2, step3],
    visualStats: stats,
    teacherMessage: `${pronoun} rất tự hào về tinh thần tự tin và bàn tay khéo léo của con. Mỗi bức tranh con vẽ đều là một viên ngọc quý!`,
    audioScript,
    raw: audioScript,
    praise: rubric1.feedback + ' ' + rubric4.feedback,
    tip: step1 + ' ' + step2,
    conclusion: `${teacherName} chấm bài vẽ của con điểm 10/10 xuất sắc!`
  };
}

// 3. Trợ lý đàm thoại sư phạm 2 chiều
export async function generateTeacherResponse(userMessage, unit, apiKey, teacher = { name: 'Thầy Cọ Nhí', pronoun: 'Thầy' }) {
  const teacherName = teacher?.name || 'Thầy Cọ Nhí';
  const pronoun = teacher?.pronoun || 'Thầy';
  const teacherTitle = teacher?.title || (teacher?.gender === 'female' ? 'Cô giáo' : 'Thầy giáo');
  const unitTitle = unit?.title || 'Bài học Mĩ thuật';
  const unitNumber = unit?.unitNumber || '';
  const grade = unit?.grade || 1;
  const summary = unit?.summary || '';
  const objectives = unit?.wordLessonPlan?.objectives?.join('; ') || '';
  const slidesInfo = (unit?.powerpointSlides || [])
    .map(s => `[Slide ${s.slideNumber}: ${s.title}] Nội dung: ${s.teacherLecture || ''}`)
    .join('\n');

  // Sinh tranh mẫu khi học sinh yêu cầu
  const isAskingForImage = /vẽ mẫu|tranh mẫu|xem hình|cho con xem|hình mẫu|xem tranh|vẽ giúp/i.test(userMessage);
  let imageUrl = null;
  if (isAskingForImage) {
    const prompt = encodeURIComponent(`an authentic hand-drawn watercolor crayon art for primary school kids about ${unitTitle}, simple cheerful lines on textured sketchbook paper, masterpiece, no 3D`);
    imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=600&height=400&model=flux&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
  }

  const trimmedKey = (apiKey || '').trim();

  if (trimmedKey && !trimmedKey.startsWith('hf_')) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${trimmedKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Bạn là "${teacherName}" - ${teacherTitle} Mĩ thuật Tiểu học tận tâm, am hiểu sâu sắc bộ sách "Kết nối tri thức với cuộc sống" (Chuẩn GDPT 2018).
THÔNG TIN BÀI HỌC HIỆN TẠI ĐANG DẠY:
- Khối lớp: Lớp ${grade}
- Chủ đề: "${unitTitle}" (${unitNumber})
- Tóm tắt nội dung bài học: "${summary}"
- Yêu cầu cần đạt chuẩn SGK: ${objectives}
- Tiến trình các hoạt động của ${pronoun}:
${slidesInfo}

Học sinh hỏi ${pronoun}: "${userMessage}"

YÊU CẦU SƯ PHẠM BẮT BUỘC:
1. Trả lời BÁM SÁT 100% ĐÚNG nội dung bài học "${unitTitle}". Hướng dẫn cụ thể, dễ hiểu, phù hợp với học sinh tiểu học.
2. Xưng "${pronoun}", gọi học sinh là "con" hoặc "họa sĩ nhí". Giọng điệu ấm áp, ngợi khen, động viên sáng tạo, kèm emoji sinh động.
3. Độ dài 3-4 câu ngắn gọn, súc tích, dễ nhớ.`
              }]
            }]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          return {
            text: replyText.trim(),
            imageUrl
          };
        }
      }
    } catch (e) {
      console.warn('Gemini chat error, fallback to local response:', e);
    }
  }

  // Phản hồi sư phạm chuyên sâu bám sát chính xác bài học đang học
  const slide3 = unit?.powerpointSlides?.find(s => s.slideNumber === 3);
  const slide2 = unit?.powerpointSlides?.find(s => s.slideNumber === 2);
  const slide1 = unit?.powerpointSlides?.find(s => s.slideNumber === 1);

  let replyText = `${teacherName} chào con! Về bài học "${unitTitle}", ${slide3?.teacherLecture || slide1?.teacherLecture || summary}`;

  if (/cách vẽ|làm sao|vẽ thế nào|hướng dẫn|các bước|làm bài/i.test(userMessage)) {
    if (slide3?.bullets && slide3.bullets.length >= 3) {
      replyText = `Bí quyết tạo hình bài "${unitTitle}" của ${pronoun} gồm 3 bước đơn giản:\n1️⃣ ${slide3.bullets[0]}\n2️⃣ ${slide3.bullets[1]}\n3️⃣ ${slide3.bullets[2]}\nCon hãy bấm vào "Vào Bảng Vẽ" để thực hành ngay nhé! 🎨✨`;
    } else {
      replyText = `${slide3?.teacherLecture || 'Hãy phác các nét lớn trước, sau đó phối màu tương phản tươi sáng con nhé!'}`;
    }
  } else if (/giảng bài|học gì|nội dung|chủ đề|khám phá/i.test(userMessage)) {
    replyText = `Trong bài "${unitTitle}" này, ${slide2?.teacherLecture || summary} Con hãy quan sát thật kĩ các đặc điểm này để đưa vào bài vẽ nhé! 🔍✨`;
  } else if (/pha màu|màu sắc/i.test(userMessage)) {
    replyText = `Bí quyết màu sắc của ${pronoun}: Con hãy dùng 3 màu gốc Đỏ, Vàng, Lam nhé. Đỏ pha Vàng thành Cam ấm áp, Vàng pha Lam thành Xanh lá mát rượi đấy! 🌈`;
  } else if (/xa gần|không gian|phối cảnh/i.test(userMessage)) {
    replyText = `Công thức luật xa gần của ${pronoun} cực dễ nhớ: "Gần thì To và Rõ, Xa thì Nhỏ và Mờ". Con kẻ đường chân trời ở khoảng một phần ba trang giấy là chuẩn nhất nha! 🌾`;
  } else if (/đẹp|khen|chấm/i.test(userMessage)) {
    replyText = `${pronoun} tin chắc bức tranh "${unitTitle}" của con sẽ rất xuất sắc! Mỗi nét vẽ tự tin của con đều chứa đựng sự sáng tạo tuyệt vời. Cố lên con nhé! 🌟`;
  }

  return {
    text: replyText,
    imageUrl
  };
}

// 4. Sinh Bài Giảng Trình Chiếu Chuẩn GDPT 2018 Bằng AI hoặc Bộ Tổng Hợp Sư Phạm
export async function generateAiPresentation({
  topic = 'Sắc Màu Quanh Em',
  grade = 1,
  numSlides = 5,
  objectives = '',
  style = 'cheerful',
  apiKey = null,
  teacher = { name: 'Thầy Cọ Nhí', pronoun: 'Thầy' }
}) {
  const teacherName = teacher?.name || 'Thầy Cọ Nhí';
  const pronoun = teacher?.pronoun || 'Thầy';
  const trimmedKey = (apiKey || (typeof localStorage !== 'undefined' ? localStorage.getItem('gemini_api_key') : null))?.trim();

  // Danh mục chủ đề màu nền theo phong cách
  const themeColors = {
    cheerful: { bg: '#FFFBEB', accent: '#D97706', card: '#FEF3C7' },
    nature: { bg: '#F0FDF4', accent: '#059669', card: '#DCFCE7' },
    ocean: { bg: '#F0F9FF', accent: '#0284C7', card: '#E0F2FE' },
    artistic: { bg: '#FFF1F2', accent: '#E11D48', card: '#FFE4E6' },
    chalkboard: { bg: '#0F172A', accent: '#F59E0B', card: '#1E293B', text: '#F8FAFC' }
  };
  const currentTheme = themeColors[style] || themeColors.cheerful;

  // 1. Nếu có Google Gemini Key -> Gửi request sinh cấu trúc bài giảng trực tiếp
  if (trimmedKey && trimmedKey.startsWith('AIza')) {
    try {
      const prompt = `Bạn là ${teacherName}, giáo viên mĩ thuật tiểu học xuất sắc theo chương trình GDPT 2018 (sách Kết Nối Tri Thức).
Hãy soạn một bài giảng trình chiếu ${numSlides} trang cho học sinh Lớp ${grade} với chủ đề: "${topic}".
Mục tiêu bài học: ${objectives || 'Khám phá hình khối, hòa sắc cơ bản và sáng tạo tác phẩm theo cảm xúc riêng'}.
Trả về DUY NHẤT một mảng JSON thuần túy (không kèm markdown \`\`\`json) gồm ${numSlides} slide.
Mỗi phần tử có cấu trúc:
{
  "phase": "Tên tiến trình (1. Khởi động / 2. Khám phá / 3. Luyện tập / 4. Vận dụng / 5. Mục tiêu / 6. Đố vui)",
  "layout": "title" hoặc "title-content" hoặc "two-column" hoặc "image-caption" hoặc "lesson-goals" hoặc "interactive-quiz",
  "title": "Tiêu đề slide ngắn gọn, sinh động",
  "subtitle": "Phụ đề gợi mở",
  "bullets": ["Gạch đầu dòng 1", "Gạch đầu dòng 2", "Gạch đầu dòng 3"],
  "speakerNote": "Lời giảng ấm áp, truyền cảm của ${pronoun} giảng cho các con (3-4 câu)",
  "illustrationPrompt": "Mô tả hình vẽ minh họa phù hợp lứa tuổi tiểu học"
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${trimmedKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2500
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const textRes = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textRes) {
          const cleanJsonStr = textRes.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJsonStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const slides = parsed.map((s, idx) => ({
              id: `ai_slide_${Date.now()}_${idx + 1}`,
              slideNumber: idx + 1,
              phase: s.phase || `Trang ${idx + 1}`,
              layout: s.layout || (idx === 0 ? 'title' : 'title-content'),
              title: s.title || `Hoạt động ${idx + 1}: ${topic}`,
              subtitle: s.subtitle || `Môn Mĩ Thuật Lớp ${grade}`,
              bullets: Array.isArray(s.bullets) ? s.bullets : ['Quan sát và cảm nhận vẻ đẹp mĩ thuật', 'Thực hành tạo hình theo cảm xúc'],
              speakerNote: s.speakerNote || `${pronoun} chào các con! Ở trang trình chiếu này, chúng ta cùng khám phá chủ đề ${topic}.`,
              background: { type: 'color', value: currentTheme.bg },
              transition: 'fade',
              visualArt: {
                title: s.title || topic,
                caption: s.illustrationPrompt || `Minh họa chủ đề ${topic}`,
                imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80'
              },
              elements: []
            }));

            return {
              success: true,
              title: `Bài Giảng: ${topic} - Lớp ${grade}`,
              topic,
              grade,
              slides,
              source: 'gemini-api'
            };
          }
        }
      }
    } catch (e) {
      console.warn('Lỗi gọi Gemini API sinh bài giảng, chuyển sang bộ tổng hợp sư phạm:', e);
    }
  }

  // 2. Bộ Tổng Hợp Sư Phạm Mĩ Thuật GDPT 2018 (Không cần API Key, tạo slide thật 100%)
  const phases = [
    { name: '1. Khởi động', icon: '🎯', layout: 'title' },
    { name: '2. Khám phá', icon: '🔍', layout: 'image-caption' },
    { name: '3. Mục tiêu học tập', icon: '📖', layout: 'lesson-goals' },
    { name: '4. Luyện tập & Sáng tạo', icon: '🎨', layout: 'two-column' },
    { name: '5. Đố vui tương tác', icon: '❓', layout: 'interactive-quiz' },
    { name: '6. Vận dụng & Trưng bày', icon: '🌟', layout: 'title-content' }
  ];

  const generatedSlides = [];
  const targetCount = Math.min(Math.max(numSlides, 3), 8);

  for (let i = 0; i < targetCount; i++) {
    const pInfo = phases[i % phases.length];
    let sLayout = pInfo.layout;
    if (i === 0) sLayout = 'title';

    let sTitle = `${pInfo.name}: ${topic}`;
    let sSubtitle = `Môn Mĩ Thuật Lớp ${grade} • Bộ sách Kết Nối Tri Thức`;
    let sBullets = [
      `Khám phá các yếu tố tạo hình độc đáo của ${topic}`,
      'Phối hợp đường nét, hình khối và hòa sắc tương phản tươi sáng',
      'Tự tin thể hiện ý tưởng và cảm xúc cá nhân qua tác phẩm'
    ];
    let sLecture = `${pronoun} chào các con học sinh Lớp ${grade}! Hôm nay chúng mình cùng tìm hiểu chủ đề "${topic}". Hãy chuẩn bị sẵn sàng màu vẽ và giấy để cùng sáng tạo nhé!`;

    if (sLayout === 'title') {
      sTitle = topic.toUpperCase();
      sSubtitle = `BÀI GIẢNG ĐIỆN TỬ MĨ THUẬT LỚP ${grade} • CHỦ ĐỀ SÁNG TẠO`;
      sLecture = `${pronoun} chào cả lớp! Tiết Mĩ thuật hôm nay, chúng ta sẽ bước vào chuyến phiêu lưu kì thú cùng chủ đề "${topic}". Cả lớp đã chuẩn bị đầy đủ bút chì, sáp màu và sự tự tin chưa nào?`;
    } else if (sLayout === 'lesson-goals') {
      sTitle = `Mục Tiêu Bài Học: ${topic}`;
      sSubtitle = 'Yêu cầu cần đạt chuẩn Chương trình Giáo dục Phổ thông 2018';
      sLecture = `Các con thân mến, sau bài học này, chúng mình sẽ nắm vững 2 mục tiêu: Mục tiêu ngắn hạn là vẽ được hình ảnh chính rõ ràng; Mục tiêu dài hạn là nuôi dưỡng tình yêu hội họa và óc thẩm mĩ tinh tế!`;
    } else if (sLayout === 'interactive-quiz') {
      sTitle = `Đố Vui Mĩ Thuật: Khám Phá ${topic}`;
      sSubtitle = 'Thử tài tư duy thẩm mỹ và nhận biết màu sắc';
      sLecture = `Đố bạn nhỏ nào tinh mắt phát hiện được câu trả lời chính xác cho câu đố vui của ${pronoun} dưới đây nhé!`;
    }

    generatedSlides.push({
      id: `smart_slide_${Date.now()}_${i + 1}`,
      slideNumber: i + 1,
      phase: pInfo.name,
      phaseIcon: pInfo.icon,
      layout: sLayout,
      title: sTitle,
      subtitle: sSubtitle,
      bullets: sBullets,
      speakerNote: sLecture,
      background: { type: 'color', value: currentTheme.bg },
      transition: 'fade',
      visualArt: {
        title: `Tác phẩm thị phạm: ${topic}`,
        caption: `Khám phá hòa sắc và bố cục đặc trưng của chủ đề ${topic}`,
        imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80'
      },
      columnLeft: {
        title: '✨ Yếu tố tạo hình chính',
        items: ['Đường nét mềm mại, uyển chuyển', 'Hình khối cân đối, trọng tâm nổi bật', 'Màu sắc ấm áp, giàu năng lượng']
      },
      columnRight: {
        title: '💡 Bí quyết của ' + teacherName,
        items: ['Phác nét lớn bằng bút chì trước', 'Nhấn đậm các chi tiết chính', 'Tô màu nền để tranh thêm sinh động']
      },
      goals: {
        shortTerm: {
          label: 'NGẮN HẠN',
          desc: `Hoàn thiện bài vẽ ${topic} với hình ảnh sinh động ngay trong tiết học.`,
          example: 'Vẽ và phối màu bức tranh đúng thời gian quy định.'
        },
        longTerm: {
          label: 'DÀI HẠN',
          desc: 'Rèn luyện tư duy thị giác, cảm thụ cái đẹp và tự tin chia sẻ ý tưởng.',
          example: 'Tích lũy kĩ năng tạo hình vững chắc cho các chủ đề tiếp theo.'
        },
        quote: 'Có mục tiêu – Có động lực – Có kết quả!'
      },
      quiz: {
        question: `Khi vẽ bức tranh về "${topic}", bước nào dưới đây giúp tranh rõ ràng và cân đối nhất?`,
        options: [
          'A. Phác hình ảnh chính vào giữa trang giấy trước',
          'B. Tô màu ngay lập tức mà không cần phác chì',
          'C. Vẽ thật nhiều chi tiết nhỏ xíu kín mép giấy'
        ],
        correctIndex: 0,
        explanation: `Đúng rồi con nhé! Luôn phác hình ảnh chính ở vị trí trọng tâm trang giấy để bức tranh đạt bố cục cân đối và đẹp mắt nhất!`
      },
      elements: []
    });
  }

  return {
    success: true,
    title: `Bài Giảng: ${topic} - Lớp ${grade}`,
    topic,
    grade,
    slides: generatedSlides,
    source: 'pedagogy-engine'
  };
}
