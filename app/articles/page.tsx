import { redirect } from "next/navigation";

/** The listing moved to /insights; keep the old path working for anything linking to it. */
export default function ArticlesIndexRedirect() {
  redirect("/insights");
}
