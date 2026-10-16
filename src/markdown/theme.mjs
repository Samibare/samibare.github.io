/**
 * Shiki theme for code blocks, built from the site palette.
 * Mostly monochrome: comments recede, numbers and constants take the accent.
 */
export default {
  name: 'stock',
  type: 'dark',
  colors: {
    'editor.background': '#0f0e0c',
    'editor.foreground': '#d9d2c5',
  },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#958e82', fontStyle: 'italic' } },
    {
      scope: ['keyword', 'keyword.control', 'storage', 'storage.type', 'storage.modifier', 'keyword.other'],
      settings: { foreground: '#eae4d8' },
    },
    { scope: ['keyword.operator', 'punctuation', 'meta.brace'], settings: { foreground: '#aba496' } },
    { scope: ['string', 'string.quoted', 'punctuation.definition.string'], settings: { foreground: '#cdb98f' } },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.character', 'constant.other', 'support.constant'],
      settings: { foreground: '#efa73c' },
    },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call.generic'], settings: { foreground: '#f0dcb8' } },
    { scope: ['entity.name.type', 'support.type', 'entity.name.class', 'storage.type.struct'], settings: { foreground: '#e2d3b3' } },
    { scope: ['variable', 'variable.other', 'variable.parameter', 'meta.definition.variable'], settings: { foreground: '#d9d2c5' } },
    { scope: ['entity.name.tag', 'entity.other.attribute-name'], settings: { foreground: '#e2d3b3' } },
    { scope: ['markup.inserted'], settings: { foreground: '#eae4d8' } },
    { scope: ['markup.deleted'], settings: { foreground: '#efa73c' } },
    { scope: ['markup.heading', 'markup.bold'], settings: { foreground: '#eae4d8', fontStyle: 'bold' } },
  ],
};
