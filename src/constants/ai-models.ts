import type { AIProvider } from '../contracts/app.schema';

export interface AIModelOption {
  readonly id: string;
  readonly provider: AIProvider;
  readonly name: string;
  readonly shortName: string;
  readonly version: string;
  readonly tag: string;
  readonly icon: string;
  readonly description: string;
  readonly highlight: string;
  readonly defaultModel: string;
  readonly recommended?: boolean;
}

export const AI_MODELS: readonly AIModelOption[] = [
  {
    id: 'gemini-flash',
    provider: 'gemini',
    name: 'Google Gemini 2.5 Flash',
    shortName: 'Gemini Flash',
    version: '2.5 Flash',
    tag: 'Khuyên dùng',
    icon: '⚡',
    description: 'Tốc độ phản hồi cực nhanh, chuẩn GDPT 2018 và SGK Kết nối tri thức.',
    highlight: 'Siêu tốc • Chuẩn GDPT 2018',
    defaultModel: 'gemini-2.5-flash',
    recommended: true,
  },
  {
    id: 'chatgpt-4o',
    provider: 'openai',
    name: 'OpenAI ChatGPT (GPT-4o)',
    shortName: 'ChatGPT-4o',
    version: 'GPT-4o',
    tag: 'Sáng tạo',
    icon: '🧠',
    description: 'Mô hình đa năng hàng đầu, hoạt động khởi động và mở rộng sáng tạo.',
    highlight: 'Sáng tạo • Đa dạng hoạt động',
    defaultModel: 'gpt-4o',
  },
  {
    id: 'claude-sonnet',
    provider: 'claude',
    name: 'Anthropic Claude 3.5 Sonnet',
    shortName: 'Claude 3.5',
    version: '3.5 Sonnet',
    tag: 'Văn phong mượt',
    icon: '🎭',
    description: 'Văn phong sư phạm mẫu mực, diễn giải sâu sắc, câu chữ tinh tế.',
    highlight: 'Hành văn chuẩn mực • Tinh tế',
    defaultModel: 'claude-3-5-sonnet-20241022',
  },
  {
    id: 'deepseek-v3',
    provider: 'deepseek',
    name: 'DeepSeek V3 / R1 Reasoner',
    shortName: 'DeepSeek V3',
    version: 'V3 / R1',
    tag: 'Logic & STEM',
    icon: '🚀',
    description: 'Tư duy phân tích logic sâu sắc, tối ưu cho Khoa học tự nhiên & Toán học.',
    highlight: 'Tư duy logic • Tối ưu Toán & STEM',
    defaultModel: 'deepseek-chat',
  },
  {
    id: 'builtin-offline',
    provider: 'builtin',
    name: 'AI Sư Phạm Tích Hợp (Offline)',
    shortName: 'AI Tích Hợp',
    version: 'Offline Engine',
    tag: 'Miễn phí 100%',
    icon: '🛡️',
    description: 'Chạy trực tiếp trên máy chủ, không cần kết nối mạng ngoài hay khóa API.',
    highlight: '100% Miễn phí • Không cần API Key',
    defaultModel: 'builtin',
  },
];

export function getAIModelById(id: string): AIModelOption {
  const found = AI_MODELS.find((m) => m.id === id || m.provider === id);
  return found || AI_MODELS[0];
}

export function getAIModelByProvider(provider: AIProvider): AIModelOption {
  const found = AI_MODELS.find((m) => m.provider === provider);
  return found || AI_MODELS[0];
}
