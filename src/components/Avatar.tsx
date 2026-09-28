const GRADIENTS = [
  ['#5b8cff', '#8c4bff'],
  ['#ff7a59', '#ff3d77'],
  ['#2bc4a5', '#1e8fe0'],
  ['#ffb03a', '#ff6a3d'],
  ['#a35bff', '#ff4bd1'],
  ['#3ac3ff', '#3a6bff'],
];

function hash(value: string) {
  let h = 0;
  for (const ch of value) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function initials(name: string) {
  const letters = name
    .replace(/^\+/, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]);
  return (letters.length > 1 ? letters[0] + letters[1] : name.replace(/^\+/, '').slice(0, 2)).toUpperCase();
}

export function Avatar({ id, name, size = 48 }: { id: string; name: string; size?: number }) {
  const [from, to] = GRADIENTS[hash(id) % GRADIENTS.length];
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      {initials(name)}
    </div>
  );
}
