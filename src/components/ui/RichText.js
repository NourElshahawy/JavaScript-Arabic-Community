// Minimal, dependency-free Markdown-ish renderer for user text: fenced code
// blocks (```), inline `code`, **bold**, *italic*, [label](url), and bare
// URLs. Output is React nodes (never dangerouslySetInnerHTML), so it can't
// inject markup. base.css already styles <pre>/<code> LTR inside RTL text.

const FENCE = /```[a-zA-Z0-9_+-]*\n?([\s\S]*?)```/g;
const INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(\[[^\]\n]+\]\([^)\s]+\))|(https?:\/\/[^\s)]+)/g;

function renderInline(text, keyPrefix) {
  const nodes = [];
  let lastIndex = 0;
  let match;
  let i = 0;
  INLINE.lastIndex = 0;

  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${keyPrefix}-i${i++}`;

    if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("[")) {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token);
      nodes.push(
        <a key={key} href={link[2]} target="_blank" rel="noreferrer noopener" className="rich-text__link">
          {link[1]}
        </a>
      );
    } else {
      nodes.push(
        <a key={key} href={token} target="_blank" rel="noreferrer noopener" className="rich-text__link ltr">
          {token}
        </a>
      );
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function RichText({ text, className = "" }) {
  if (!text) return null;

  const segments = [];
  let lastIndex = 0;
  let match;
  FENCE.lastIndex = 0;

  while ((match = FENCE.exec(text)) !== null) {
    if (match.index > lastIndex) segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    segments.push({ type: "code", value: match[1].replace(/\n$/, "") });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) segments.push({ type: "text", value: text.slice(lastIndex) });
  if (segments.length === 0) segments.push({ type: "text", value: text });

  return (
    <div className={`rich-text ${className}`.trim()}>
      {segments.map((segment, index) =>
        segment.type === "code" ? (
          <pre key={index}>
            <code>{segment.value}</code>
          </pre>
        ) : (
          <p key={index} className="rich-text__p">
            {renderInline(segment.value, index)}
          </p>
        )
      )}
    </div>
  );
}
