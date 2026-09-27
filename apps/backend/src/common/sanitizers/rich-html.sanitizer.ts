import { SanitizerConstraint } from 'class-sanitizer';
import * as sanitizeHtml from 'sanitize-html';

/**
 * Sanitizes HTML content while allowing safe formatting and linking tags.
 * Safe tags: b, i, em, strong, a, p, ul, ol, li, br, h3, h4, h5, code, pre, blockquote
 * Prevents script injection and other malicious content while preserving rich formatting.
 */
@SanitizerConstraint()
export class RichHtmlSanitizer {
  sanitize(value: any): any {
    if (typeof value !== 'string') {
      return value;
    }
    return sanitizeHtml(value, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br', 'h3', 'h4', 'h5', 'code', 'pre', 'blockquote'],
      allowedAttributes: {
        'a': ['href', 'title'],
      },
      disallowedTagsMode: 'discard',
      allowedSchemesByTag: {
        'a': ['http', 'https', 'mailto'],
      },
    });
  }
}
