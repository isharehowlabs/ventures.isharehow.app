// MCP Server for Figma/VSCode integration
// This acts as a bridge between Figma designs and VSCode files

class MCPServer {
  constructor() {
    this.codeLinks = new Map(); // Map of Figma component IDs to code file paths
    this.designTokens = new Map(); // Map of design token names to values
  }

  // Link a Figma component to a code file
  linkComponentToCode(figmaComponentId, codeFilePath, codeComponentName, figmaFileId) {
    const link = {
      filePath: codeFilePath,
      componentName: codeComponentName,
      linkedAt: new Date().toISOString(),
      figmaFileId: figmaFileId || null,
    };
    this.codeLinks.set(figmaComponentId, link);
    return { success: true, link, componentId: figmaComponentId };
  }

  // Get all code links for a Figma file
  getCodeLinks(figmaFileId) {
    const links = Array.from(this.codeLinks.entries())
      .filter(([_, link]) => link.figmaFileId === figmaFileId)
      .map(([componentId, link]) => ({
        componentId,
        ...link,
      }));
    return links;
  }

  // Sync design tokens from Figma
  syncDesignTokens(tokens) {
    tokens.forEach((token) => {
      this.designTokens.set(token.name, {
        value: token.value,
        type: token.type,
        updatedAt: new Date().toISOString(),
      });
    });
    return { success: true, tokensSynced: tokens.length };
  }

  // Get design tokens
  getDesignTokens() {
    return Array.from(this.designTokens.entries()).map(([name, data]) => ({
      name,
      ...data,
    }));
  }

  // Generate code snippet with design tokens
  generateCodeSnippet(componentId, language = 'typescript') {
    const link = this.codeLinks.get(componentId);
    if (!link) {
      return null;
    }

    const tokens = this.getDesignTokens();
    const tokenImports = tokens
      .map((token) => `  ${token.name}: '${token.value}',`)
      .join('\n');

    return {
      filePath: link.filePath,
      componentName: link.componentName,
      code: `// Auto-generated from Figma component: ${componentId}
import { ${link.componentName} } from '${link.filePath}';

const designTokens = {
${tokenImports}
};

export default ${link.componentName};`,
    };
  }
}

// Singleton instance
const mcpServer = new MCPServer();

export default mcpServer;

