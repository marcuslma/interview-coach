import { SessionWorkspace } from "@/components/session-workspace";

type PageProps = { params: Promise<{ id: string }> };

export default async function SessionPage(props: PageProps) {
  const { id } = await props.params;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
      <SessionWorkspace sessionId={id} />
    </div>
  );
}
