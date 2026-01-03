interface ISectionHeading {
  title: string;
  description: string;
  marginBottom?: string;
}

export function SectionHeading({
  title,
  description,
  marginBottom = "mb-8",
}: ISectionHeading) {
  return (
    <div className={marginBottom}>
      <h2 className="text-3xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
