import { listMessages } from "@/lib/messages";
import PageHead from "../../components/PageHead";
import MessageList from "./MessageList";

export const dynamic = "force-dynamic";

export default async function MessagesAdmin() {
  const messages = await listMessages();

  return (
    <>
      <PageHead eyebrow="AUDIENCE" title="Inbox" />
      <MessageList messages={messages} />
    </>
  );
}
