import { redirect } from "next/navigation";

/** Alte URL — weiterleiten auf /success */
export default function CheckoutSuccessRedirect({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const id = searchParams.session_id;
  if (id) {
    redirect(`/success?session_id=${encodeURIComponent(id)}`);
  }
  redirect("/success");
}
