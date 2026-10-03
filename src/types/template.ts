import { z } from 'zod';

export const SlideThemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  bgHeroHex: z.string(),
  bgSlideHex: z.string(),
  accentHex: z.string(),
  textHeroHex: z.string(),
  textSlideHex: z.string(),
  badgeBg: z.string(),
  badgeText: z.string(),
  previewGradient: z.string(),
  unifiedBgClass: z.string(),
  unifiedCardClass: z.string(),
  unifiedTitleClass: z.string(),
  unifiedTextClass: z.string(),
});

export type SlideTheme = z.infer<typeof SlideThemeSchema>;
