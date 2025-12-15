interface ISectionHeading {
  title: string;
  description: string;
}

export function SectionHeading({ title, description }: ISectionHeading) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
