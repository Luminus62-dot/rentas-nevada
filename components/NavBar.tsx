import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="w-full border-b p-4 flex justify-between">
      <Link href="/" className="font-bold">Rentas Nevada</Link>
      <div className="flex gap-4">
        <Link href="/search">Buscar</Link>
        <Link href="/post">Publicar</Link>
        <Link href="/login">Login</Link>
      </div>
    </nav>
  );
}
