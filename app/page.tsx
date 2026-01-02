import Link from "next/link";

export default function Home() {
  return (
    <section className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Rentas reales en Nevada
      </h1>

      <Link
        href="/search"
        className="block bg-black text-white text-center p-3 rounded"
      >
        Buscar rentas
      </Link>
    </section>
  );
}
