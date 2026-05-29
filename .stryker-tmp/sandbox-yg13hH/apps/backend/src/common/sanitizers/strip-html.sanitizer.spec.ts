import { StripHtmlSanitizer } from '../../../src/common/sanitizers/strip-html.sanitizer';

describe('StripHtmlSanitizer', () => {
  let sanitizer: StripHtmlSanitizer;

  beforeEach(() => {
    sanitizer = new StripHtmlSanitizer();
  });

  it('strips script tags (XSS)', () => {
    const input = 'Hello <script>alert("xss")</script> World';
    expect(sanitizer.sanitize(input)).toBe('Hello  World');
  });

  it('strips all HTML tags from bio/description fields', () => {
    const input = '<b>Bold</b> and <i>italic</i> text';
    expect(sanitizer.sanitize(input)).toBe('Bold and italic text');
  });

  it('strips HTML event handlers', () => {
    const input = '<img src=x onerror="alert(1)"/>';
    expect(sanitizer.sanitize(input)).toBe('');
  });

  it('returns non-string values unchanged', () => {
    expect(sanitizer.sanitize(42)).toBe(42);
    expect(sanitizer.sanitize(null)).toBe(null);
  });

  it('returns plain text unchanged', () => {
    const input = 'Just plain text';
    expect(sanitizer.sanitize(input)).toBe('Just plain text');
  });
});
