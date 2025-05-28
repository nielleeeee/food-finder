import MessageForm from "@/components/form/form";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2">
      <section className="container w-full px-4 mx-auto">
        <h1>Restaurant Finder</h1>

        <MessageForm />
      </section>
    </main>
  );
}
