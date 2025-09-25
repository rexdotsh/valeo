import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/valeo.svg"
            alt="Valeo"
            width={150}
            height={150}
            className="h-11 w-auto"
          />
        </Link>
        <Link
          href="/doctor"
          className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md font-medium transition-colors"
        >
          Doctor portal
        </Link>
      </header>

      <div className="flex flex-1 flex-col justify-end p-4 pb-4">
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-muted/50 h-96 rounded-xl md:col-span-1" />
            <div className="bg-muted/50 h-96 rounded-xl md:col-span-2" />
            <div className="bg-muted/50 h-72 rounded-xl md:col-span-2" />
            <div className="bg-muted/50 h-72 rounded-xl md:col-span-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
