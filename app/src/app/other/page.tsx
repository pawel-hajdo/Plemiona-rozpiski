"use client"
import { useEffect, useState } from "react";
import { getPlayerId } from "@/lib/utils";
import { getPlayerLinks, getSourceVillagesByType } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {VillageData} from "@/lib/types";

type GroupedData = Record<string, { allNobles: VillageData[], offs: VillageData[] }>;
type ButtonTextState = Record<string, string>;

export default function Other() {
    const [groupedData, setGroupedData] = useState<GroupedData>({});
    const [buttonText, setButtonText] = useState<ButtonTextState>({});
    const playerId = getPlayerId();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [noblesData1, noblesData2, offsData] = await Promise.all([
                    getSourceVillagesByType(playerId, 'SZLACHCIC'),
                    getSourceVillagesByType(playerId, 'Gruby'),
                    getSourceVillagesByType(playerId, 'OFF')
                ]);

                const mergedNobles = mergeAndSumData([...noblesData1, ...noblesData2]);
                const grouped = groupDataByWorld(mergedNobles, offsData);
                setGroupedData(grouped);

                const initialButtonText: ButtonTextState = {};
                Object.keys(grouped).forEach(world => {
                    initialButtonText[`allNobles-${world}`] = "Kopiuj do schowka";
                    initialButtonText[`offs-${world}`] = "Kopiuj do schowka";
                });
                setButtonText(initialButtonText);

            } catch (error) {
                console.error("Błąd podczas pobierania danych:", error);
            }
        };

        fetchData();
    }, []);

    const groupDataByWorld = (nobles: VillageData[], offs: VillageData[]): GroupedData => {
        const grouped: GroupedData = {};

        [...nobles, ...offs].forEach(item => {
            const { world } = item;
            if (!grouped[world]) {
                grouped[world] = { allNobles: [], offs: [] };
            }
            if (nobles.includes(item)) {
                grouped[world].allNobles.push(item);
            } else {
                grouped[world].offs.push(item);
            }
        });

        return grouped;
    };

    const formatData = (data: VillageData[], includeCount = true): string => {
        return data.map(item =>
            includeCount ? `${item.source} - ${item.count}` : item.source
        ).join('\n');
    };

    const mergeAndSumData = (data: VillageData[]): VillageData[] => {
        const resultMap = data.reduce((acc: Record<string, VillageData>, item) => {
            if (acc[item.source]) {
                acc[item.source].count += item.count;
            } else {
                acc[item.source] = { ...item };
            }
            return acc;
        }, {});

        return Object.values(resultMap);
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                setButtonText(prev => ({ ...prev, [type]: "Skopiowano!" }));
                setTimeout(() => {
                    setButtonText(prev => ({ ...prev, [type]: "Kopiuj do schowka" }));
                }, 2000);
            })
            .catch(err => console.error("Błąd podczas kopiowania tekstu: ", err));
    };

    return (
        <div className="p-2 sm:p-8">
            <h1 className="text-3xl font-bold mb-6">Inne</h1>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>A po co to?</AccordionTrigger>
                    <AccordionContent>
                        Poniżej znajduje się lista kordów (Twoich wiosek) z których są rozpisane ataki danego typu (offy, grube itd).<br /><br />
                        Możesz ją wykorzystać np. do wklejenia na mapie w plemionach, gdy potrzebujesz sprawdzić czy masz jakieś nierozpisane offy
                        albo żeby sprawdzić ile grubych masz do wysłania z danej wioski.<br /><br />
                        (Do zaznaczania na mapie nie trzeba nic usuwać, można skopiować kordy razem z ilością i zadziała)
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {Object.entries(groupedData).map(([world, { allNobles, offs }]) => (
                <div key={world} className="mt-6">
                    <h2 className="text-xl font-semibold">Świat {world}</h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                        <div>
                            <div className="flex items-center mb-2">
                                <Label htmlFor={`allNobles-${world}`} className="text-lg font-medium mr-2">Wszystkie Szlachcice</Label>
                                <Button onClick={() => copyToClipboard(formatData(allNobles), `allNobles-${world}`)} variant="outline">
                                    {buttonText[`allNobles-${world}`]}
                                </Button>
                            </div>
                            <Textarea
                                rows={10}
                                className="w-full border border-gray-300 rounded-md p-2"
                                value={formatData(allNobles)}
                                readOnly
                                id={`allNobles-${world}`}
                            />
                        </div>
                        <div>
                            <div className="flex items-center mb-2">
                                <Label htmlFor={`offs-${world}`} className="text-lg font-medium mr-2">Offy</Label>
                                <Button onClick={() => copyToClipboard(formatData(offs, false), `offs-${world}`)} variant="outline">
                                    {buttonText[`offs-${world}`]}
                                </Button>
                            </div>
                            <Textarea
                                rows={10}
                                className="w-full border border-gray-300 rounded-md p-2"
                                value={formatData(offs, false)}
                                readOnly
                                id={`offs-${world}`}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
