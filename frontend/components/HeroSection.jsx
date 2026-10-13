export default function HeroSection() {
  return (
    <section className="mb-10 relative">
      <p className="text-xs font-semibold tracking-widest text-cafe-accent uppercase mb-3 flex items-center gap-2">
        <i className="ph-fill ph-sparkle text-sm"></i> Made fresh, just for you
      </p>

      <h2 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-4 text-cafe-text">
        Good mood, <br />
        <span className="italic text-cafe-accent">great coffee.</span>
      </h2>

      <p className="text-gray-600 max-w-md">
        Slow mornings, quick orders. Find your café favorite and we'll take care
        of the rest.
      </p>
    </section>
  );
}
