import MessageForm from "@/components/form/form";
import PlaceList from "@/components/placeList/placeList";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2">
      <section className="container w-full py-8 px-4 mx-auto">
        <h1 className="text-3xl font-bold mb-10 text-center">Place Finder</h1>

        <PlaceList />

        <MessageForm />
      </section>
    </main>
  );
}
