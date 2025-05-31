"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, ListOrdered, AlertTriangle, UploadCloud } from "lucide-react";

import { pdfSummarization } from "@/ai/flows/pdf-summarization";
import { extractKeySentences } from "@/ai/flows/key-sentence-extraction";

export default function PdfProcessor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [keySentences, setKeySentences] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please select a PDF file.");
        toast({
          title: "Invalid File Type",
          description: "Only PDF files are accepted.",
          variant: "destructive",
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Clear the input
        }
        return;
      }
      setSelectedFile(file);
      setError(null); // Clear previous errors
    } else {
      setSelectedFile(null);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file to analyze.");
      toast({
        title: "File Required",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary(null);
    setKeySentences(null);

    try {
      toast({
        title: "Processing PDF",
        description: "Uploading and generating summary...",
      });
      
      const pdfDataUri = await fileToDataUri(selectedFile);
      
      const summaryResult = await pdfSummarization({ pdfDataUri });
      setSummary(summaryResult.summary);
      toast({
        title: "Summary Generated!",
        description: "Extracting key sentences...",
      });

      const keySentencesResult = await extractKeySentences({
        documentSummary: summaryResult.summary,
      });
      setKeySentences(keySentencesResult.keySentences);
      toast({
        title: "Analysis Complete!",
        description: "Summary and key sentences are ready.",
        variant: "default",
        className: "bg-primary text-primary-foreground",
      });

    } catch (e: any) {
      const errorMessage = e.message || "An unexpected error occurred.";
      setError(`Failed to process PDF: ${errorMessage}`);
      toast({
        title: "Error",
        description: `Processing failed: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError(null);
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center font-headline text-2xl">
            <UploadCloud className="mr-2 h-6 w-6 text-primary" />
            Upload PDF Document
          </CardTitle>
          <CardDescription>
            Select a PDF file from your device to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="mb-1 text-sm leading-relaxed border-input focus:ring-accent"
              disabled={isLoading}
              ref={fileInputRef}
            />
            {selectedFile && !isLoading && (
              <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                <span className="text-sm text-muted-foreground truncate">
                  {selectedFile.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-destructive hover:text-destructive/80"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedFile}
            className="w-full md:w-auto mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Generate Summary & Key Sentences"
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="shadow-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && !summary && (
         <Card className="shadow-lg transition-opacity duration-300 ease-in-out">
          <CardHeader>
            <CardTitle className="flex items-center font-headline text-xl">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
              Generating Insights...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please wait while we analyze your document. This may take a moment for larger PDFs.</p>
             <div className="space-y-2 mt-4">
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {summary && (
        <Card className="shadow-lg transition-opacity duration-500 ease-in-out animate-fadeIn">
          <CardHeader>
            <CardTitle className="flex items-center font-headline text-xl">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Document Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap text-base leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      )}

      {keySentences && (
        <Card className="shadow-lg transition-opacity duration-500 ease-in-out animate-fadeIn">
          <CardHeader>
            <CardTitle className="flex items-center font-headline text-xl">
              <ListOrdered className="mr-2 h-5 w-5 text-primary" />
              Key Sentences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {keySentences.split('\\n').map((sentence, index) => (
                sentence.trim() && <li key={index} className="text-foreground text-base leading-relaxed">{sentence}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
