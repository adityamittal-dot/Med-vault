/**
 * Utility functions to clean and format AI-generated text
 * for safe, readable UI display (no markdown rendering).
 */

/**
 * Cleans markdown and formatting artifacts from AI responses
 */
export function cleanMarkdown(text: string): string {
  if (!text) return "";

  return (
    text
      // Remove markdown headers (# ## ### ####)
      .replace(/^#{1,6}\s*/gm, "")

      // Remove bold (**text**) and italic (*text* or _text_)
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/_(.*?)_/g, "$1")

      // Remove inline code (`code`)
      .replace(/`([^`]+)`/g, "$1")

      // Remove strikethrough (~~text~~)
      .replace(/~~(.*?)~~/g, "$1")

      // Remove blockquotes (> text)
      .replace(/^>\s?/gm, "")

      // Remove horizontal rules (---, ___, ***)
      .replace(/^(---|___|\*\*\*)$/gm, "")

      // Convert markdown bullet points to plain bullets
      .replace(/^[\s]*[-*+]\s+/gm, "• ")

      // Remove numbered list markdown (1. 2. 3.)
      .replace(/^\d+\.\s+/gm, "")

      // Remove links but keep text [text](url)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

      // Remove images ![alt](url)
      .replace(/!\[.*?\]\(.*?\)/g, "")

      // Remove HTML tags if present
      .replace(/<\/?[^>]+(>|$)/g, "")

      // Normalize multiple spaces
      .replace(/[ \t]{2,}/g, " ")

      // Normalize excessive newlines (keep max 2)
      .replace(/\n{3,}/g, "\n\n")

      // Trim start/end whitespace
      .trim()
  );
}

/**
 * Formats text specifically for medical / AI explanations
 * (keeps bullets, spacing, and clarity)
 */
export function formatAIText(text: string): string {
  if (!text) return "";

  const cleaned = cleanMarkdown(text);

  return (
    cleaned
      // Ensure bullet points start on new lines
      .replace(/•\s*/g, "\n• ")

      // Add spacing after sentences if missing
      .replace(/([a-z])([A-Z])/g, "$1. $2")

      // Normalize again after transformations
      .replace(/\n{3,}/g, "\n\n")

      .trim()
  );
}

export function formatTextForDisplay(text: string): string {
  return cleanMarkdown(text);
}
