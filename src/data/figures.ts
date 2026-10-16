/**
 * Program headers of bins/RW-RWE.out from the research repository,
 * as printed by `readelf -lW bins/RW-RWE.out` (PhysAddr and FileSiz omitted).
 */
export interface PhdrRow {
  index: number;
  type: string;
  offset: string;
  memsz: string;
  /** Three slots: R, W, E. A space means the flag is not set. */
  flags: string;
  align: string;
}

export const rwRweCommand = 'readelf -lW bins/RW-RWE.out';

export const rwRweHeaders: PhdrRow[] = [
  { index: 0, type: 'PHDR', offset: '0x000040', memsz: '0x000310', flags: 'R  ', align: '0x8' },
  { index: 1, type: 'INTERP', offset: '0x000374', memsz: '0x00001c', flags: 'R  ', align: '0x1' },
  { index: 2, type: 'LOAD', offset: '0x000000', memsz: '0x000718', flags: 'R  ', align: '0x1000' },
  { index: 3, type: 'LOAD', offset: '0x001000', memsz: '0x0002d5', flags: 'R E', align: '0x1000' },
  { index: 4, type: 'LOAD', offset: '0x002000', memsz: '0x0001b0', flags: 'R  ', align: '0x1000' },
  { index: 5, type: 'LOAD', offset: '0x002d98', memsz: '0x000370', flags: 'RW ', align: '0x1000' },
  { index: 6, type: 'DYNAMIC', offset: '0x002da8', memsz: '0x0001f0', flags: 'RW ', align: '0x8' },
  { index: 7, type: 'GNU_STACK', offset: '0x000000', memsz: '0x000000', flags: 'RW ', align: '0x4' },
  { index: 8, type: 'NOTE', offset: '0x002160', memsz: '0x000030', flags: 'R  ', align: '0x8' },
  { index: 9, type: 'NOTE', offset: '0x002190', memsz: '0x000020', flags: 'R  ', align: '0x4' },
  { index: 10, type: 'GNU_PROPERTY', offset: '0x002160', memsz: '0x000030', flags: 'R  ', align: '0x8' },
  { index: 11, type: 'GNU_EH_FRAME', offset: '0x002030', memsz: '0x000044', flags: 'R  ', align: '0x4' },
  { index: 12, type: 'GNU_STACK', offset: '0x000000', memsz: '0x000000', flags: 'RWE', align: '0x10' },
  { index: 13, type: 'GNU_RELRO', offset: '0x002d98', memsz: '0x000268', flags: 'R  ', align: '0x1' },
];
