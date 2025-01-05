"use client"
import * as React from "react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {FormEvent, useState} from "react";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {sendReports} from "@/lib/api";
import {getPlayerId} from "@/lib/utils";

export default function ReportsPage(){
    const [reports, setReports] = useState<string>("");
    const [error, setError] = useState("")
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const extractReportIds = (input: string) => {
        const regex = /\[report\]([a-f0-9]{32})\[\/report\]/g;
        const matches = Array.from(input.matchAll(regex));
        return matches.map((match) => match[1]);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        const reportIds = extractReportIds(reports);

        if (reportIds.length === 0) {
            setError("Nie znaleziono żadnych poprawnych raportów w przesłanych danych.");
            return;
        }

        setIsSubmitting(true);

        try {
            const responseData = await sendReports(getPlayerId(),reportIds)
            setReports("");
            await new Promise(resolve => setTimeout(resolve, 300));
            setSuccess(`Pomyślnie dodano ${responseData.addedReportsCount} ${
                responseData.addedReportsCount === 1 ? 'raport' :
                    responseData.addedReportsCount > 0 && responseData.addedReportsCount < 5 ? 'raporty' :
                        'raportów'
            }`);
        } catch (error) {
            setError("Wystąpił błąd podczas przesyłania raportów.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="p-2 sm:p-8">
            <h1 className="text-3xl font-bold mb-6">Raporty</h1>
            <Accordion type="single" collapsible className="w-full mb-6">
                <AccordionItem value="item-1">
                    <AccordionTrigger>Instrukcja</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <p className="font-medium text-lg">Aby przesłać nowe raporty do bazy:</p>
                        <ol className="list-decimal space-y-3 ml-5">
                            <li className="pl-2">
                    <span className="text-slate-800 dark:text-slate-200">
                        Przejdź do ekranu z raportami i zaznacz raporty do opublikowania
                    </span>
                            </li>
                            <li className="pl-2">
                    <span className="text-slate-800 dark:text-slate-200">
                        Kliknij <span className="font-medium">Opublikuj</span>, a następnie <span className="font-medium">Prześlij</span>
                    </span>
                            </li>
                            <li className="pl-2">
                    <span className="text-slate-800 dark:text-slate-200">
                        Skopiuj wygenerowaną przez grę listę opublikowanych raportów
                    </span>
                            </li>
                            <li className="pl-2">
                    <span className="text-slate-800 dark:text-slate-200">
                        Wklej skopiowaną listę w polu poniżej
                    </span>
                            </li>
                        </ol>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <form onSubmit={handleSubmit} className="space-y-4 shadow-md">
                <div>
                    <Label htmlFor="reports" className="block mb-2">
                        Dodaj raporty
                    </Label>
                    <Textarea
                        id="reports"
                        value={reports}
                        onChange={(e) => setReports(e.target.value)}
                        rows={6}
                        className="w-full"
                    />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Wysyłanie..." : "Prześlij raporty"}
                </Button>
            </form>
        </div>
    )
}
