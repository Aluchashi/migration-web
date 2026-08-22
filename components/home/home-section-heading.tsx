type Props = { title: string; center?: boolean };

export function HomeSectionHeading({ title, center }: Props) {
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">{title}</h2>
    </div>
  );
}
