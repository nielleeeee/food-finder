import MessageForm from "@/components/form/form";
import MessageResponse from "@/components/messageResponse/messageResponse";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2">
      <section className="container w-full px-4 mx-auto">
        <h1>Restaurant Finder</h1>

        <MessageForm />

        <MessageResponse />
      </section>
    </main>
  );
}
