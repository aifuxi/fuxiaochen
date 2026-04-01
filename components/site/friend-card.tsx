export function FriendCard({
  name,
  title,
  note,
  avatar,
}: {
  name: string;
  title: string;
  note: string;
  avatar: string;
}) {
  return (
    <article
      className={`
        rounded-[1rem] border border-white/10 bg-card p-6 backdrop-blur-xl transition-all duration-[400ms]
        ease-[var(--ease-smooth)]
        hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_30px_rgb(16_185_129_/_0.12)]
      `}
    >
      <div className="mb-5 flex items-center gap-4">
        <img
          alt={name}
          className="size-14 rounded-full border-2 border-white/10 object-cover transition-colors duration-300"
          src={avatar}
        />
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-fg">{name}</h3>
          <p className="text-sm text-muted">{title}</p>
        </div>
      </div>
      <p className="text-sm leading-7 text-muted">{note}</p>
    </article>
  );
}
