export const codeLanguages = [
  { value: "plaintext", label: "纯文本", aliases: ["text", "txt", "plain"] },
  { value: "javascript", label: "JavaScript", aliases: ["js", "mjs", "cjs"] },
  { value: "jsx", label: "JSX", aliases: [] },
  { value: "typescript", label: "TypeScript", aliases: ["ts", "mts", "cts"] },
  { value: "tsx", label: "TSX", aliases: [] },
  { value: "html", label: "HTML", aliases: ["xml", "xhtml", "svg"] },
  { value: "css", label: "CSS", aliases: [] },
  { value: "json", label: "JSON", aliases: [] },
  { value: "bash", label: "Bash", aliases: ["sh", "shell", "zsh"] },
  { value: "python", label: "Python", aliases: ["py"] },
  { value: "sql", label: "SQL", aliases: [] },
  { value: "go", label: "Go", aliases: ["golang"] },
  { value: "rust", label: "Rust", aliases: ["rs"] },
  { value: "java", label: "Java", aliases: [] },
  { value: "c", label: "C", aliases: ["h"] },
  { value: "cpp", label: "C++", aliases: ["c++", "cc", "cxx", "hpp", "h++"] },
  { value: "yaml", label: "YAML", aliases: ["yml"] },
  { value: "markdown", label: "Markdown", aliases: ["md", "mkdown", "mkd"] },
];

export function codeLanguage(language: string | null | undefined) {
  const name = language?.trim().toLowerCase() || "plaintext";
  return codeLanguages.find((item) => item.value === name || item.aliases.includes(name));
}

export function codeLanguageLabel(language: string | null | undefined) {
  return codeLanguage(language)?.label ?? language ?? "纯文本";
}
