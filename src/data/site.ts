import { resume } from './resume';

/**
 * Site-wide identity and contact details.
 * Contact fields render only when set; set one to `null` to hide it.
 */
export const site = {
  name: resume.name,
  handle: 'Samibare',
  url: 'https://goukiwilliams.com',
  /** Search and social description: the résumé summary, word for word. */
  description: resume.summary,
  github: 'https://github.com/Samibare',
  sourceRepo: 'https://github.com/Samibare/samibare.github.io',

  email: 'goukiw07@gmail.com' as string | null,
  /** Shown exactly as written. */
  phone: '630-675-0318' as string | null,
  /** Used for the tap-to-call link. */
  phoneE164: '+16306750318' as string | null,
  /** A PDF in /public. */
  resume: '/Gouki-Williams-Resume.pdf' as string | null,
};
