import PdfProcessor from '@/components/pdf-processor';
import { Separator } from '@/components/ui/separator';

export default function PDFigestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-4xl text-center my-8 md:my-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
          PDFigest
        </h1>
        <p className="text-muted-foreground mt-3 text-lg md:text-xl">
          Upload your PDF content, and we'll distill the essence for you.
        </p>
      </header>
      <Separator className="my-4 md:my-6 w-full max-w-4xl"/>
      <main className="w-full max-w-4xl">
        <PdfProcessor />
      </main>
      <footer className="w-full max-w-4xl text-center text-muted-foreground mt-12 py-6 border-t border-border">
        <p>&copy; {new Date().getFullYear()} PDFigest. Powered by AI.</p>
      </footer>
    </div>
  );
}
