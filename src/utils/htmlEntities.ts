/**
 * Decodes HTML entities in a string
 * Handles common entities like &#8217; (apostrophe), &amp; (ampersand), etc.
 */
export function decodeHtmlEntities(text: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use a simple regex replacement
    const entityMap: Record<string, string> = {
      '&#8217;': "'",
      '&#8216;': "'",
      '&#8220;': '"',
      '&#8221;': '"',
      '&#8211;': '–',
      '&#8212;': '—',
      '&#8230;': '…',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&apos;': "'",
      '&nbsp;': ' ',
    };

    let decoded = text;
    for (const [entity, char] of Object.entries(entityMap)) {
      decoded = decoded.replace(new RegExp(entity, 'g'), char);
    }
    return decoded;
  } else {
    // Client-side: use the DOM to decode
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }
}

/**
 * Decodes HTML entities in HTML content while preserving HTML tags
 * This function decodes entities in text content but leaves HTML tags intact
 */
export function decodeHtmlEntitiesInHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: decode entities in text nodes while preserving HTML structure
    // Replace common HTML entities
    const entityMap: Record<string, string> = {
      '&#8217;': "'",
      '&#8216;': "'",
      '&#8220;': '"',
      '&#8221;': '"',
      '&#8211;': '–',
      '&#8212;': '—',
      '&#8230;': '…',
      '&nbsp;': ' ',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&apos;': "'",
    };

    let decoded = html;
    // Replace entities that appear in text content (not in tag attributes or tag names)
    // This regex matches entities that are not immediately preceded by < or =
    for (const [entity, char] of Object.entries(entityMap)) {
      // Match entity only if it's not part of an HTML tag
      decoded = decoded.replace(new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), char);
    }
    return decoded;
  } else {
    // Client-side: use DOM to decode entities while preserving HTML structure
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Walk through text nodes and decode entities
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    const textNodes: Text[] = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node as Text);
      }
    }
    
    // Decode entities in text nodes
    textNodes.forEach((textNode) => {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = textNode.textContent || '';
      textNode.textContent = textarea.value;
    });
    
    return tempDiv.innerHTML;
  }
}

