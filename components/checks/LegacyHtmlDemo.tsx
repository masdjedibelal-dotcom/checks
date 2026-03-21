"use client";

type Props = { slug: string; title: string };

/** Lädt die vorhandene HTML-Demo aus /public/demo — bis die JSX-Quellen nach React portiert sind. */
export default function LegacyHtmlDemo({ slug, title }: Props) {
  return (
    <iframe
      title={title}
      src={`/demo/${slug}.html`}
      className="h-full min-h-[520px] w-full flex-1 border-0 bg-[#f5f4f0]"
    />
  );
}
