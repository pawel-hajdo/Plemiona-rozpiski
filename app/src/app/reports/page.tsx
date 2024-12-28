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
                    <AccordionContent>
                        Coś tu będzie
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
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Wysyłanie..." : "Prześlij raporty"}
                </Button>
            </form>
        </div>
    )
}
