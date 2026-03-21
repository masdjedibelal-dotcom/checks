import Link from "next/link";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a96e]/15 text-2xl">
        ✓
      </div>
      <h1 className="mb-2 text-xl font-bold text-[#0d0d0d]">Zahlung erfolgreich</h1>
      <p className="mb-6 text-sm text-black/45">
        Vielen Dank! Session:{" "}
        <code className="text-xs">{searchParams.session_id ?? "—"}</code>
        <br />
        E-Mail mit Download folgt (Webhook/Resend nach Einrichtung).
      </p>
      <Link
        href="/templates"
        className="inline-block rounded-lg bg-[#0d0d0d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#c9a96e] hover:text-black"
      >
        Zur Galerie
      </Link>
    </main>
  );
}
