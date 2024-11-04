"use client"
import {useEffect, useState} from "react";
import {getPlayerId} from "@/lib/utils";
import {getPlayerLinks, getSourceVillagesByType} from "@/lib/api";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import * as React from "react";
import {Button} from "@/components/ui/button";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {NobleData} from "@/lib/types";

type Accumulator = Record<string, number>;
type ButtonType = 'nobles' | 'fakeNobles' | 'defNobles' | 'allNobles' | 'offs';

export default function Other(){
    const [offs, setOffs] = useState([])
    const [allNobles, setAllNobles] = useState<NobleData[]>([]);
    const [buttonText, setButtonText] = useState({
        allNobles: "Kopiuj do schowka",
        offs: "Kopiuj do schowka"
    });
    const playerId = getPlayerId();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [noblesData1, noblesData2, offsData] = await Promise.all([
                    getSourceVillagesByType(playerId, 'SZLACHCIC'),
                    getSourceVillagesByType(playerId, 'Gruby'),
                    getSourceVillagesByType(playerId, 'OFF')
                ]);
                setOffs(offsData);
                console.log(noblesData1);
                console.log(noblesData2);
                const mergedNobles = mergeAndSumData([noblesData1, noblesData2]);
                setAllNobles(mergedNobles);
            } catch (error) {
                console.error("Błąd podczas pobierania danych:", error);
            }
        }

        fetchData();
    }, []);

    const formatData = (data: NobleData[], includeCount = true): string => {
        return data.map(item => {
            return includeCount
                ? `${item.source} - ${item.count}`
                : item.source;
        }).join('\n');
    };

    const mergeAndSumData = (dataArrays: NobleData[]): NobleData[] => {
        const combined = dataArrays.flat();

        const resultMap = combined.reduce((acc: Accumulator, item) => {
            if (acc[item.source]) {
                acc[item.source] += item.count;
            } else {
                acc[item.source] = item.count;
            }
            return acc;
        }, {});

        return Object.keys(resultMap).map(key => ({ source: key, count: resultMap[key] }));
    };

    const copyToClipboard = (text: string, type: ButtonType) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                setButtonText(prev => ({ ...prev, [type]: "Skopiowano!" }));
                setTimeout(() => {
                    setButtonText(prev => ({ ...prev, [type]: "Kopiuj do schowka" }));
                }, 2000); // Reset after 2s
            })
            .catch(err => {
                console.error("Błąd podczas kopiowania tekstu: ", err);
            });
    };

    return (
        <div className="p-2 sm:p-8">
            <h1 className="text-3xl font-bold mb-6">Inne</h1>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>A po co to?</AccordionTrigger>
                    <AccordionContent>
                        Poniżej znajduje się lista kordów (Twoich wiosek) z których są rozpisane ataki danego typu (offy, grube itd).<br /><br />
                        Możesz ją wykorzystać np. do wklejenia na mapie w plemionach gdy potrzebujesz sprawdzić czy masz jakieś nierozpisane offy
                        albo żeby sprawdzić ile grubych masz do wysłania z danej wioski, bo np. broniłeś konta i Ci padły, i nie wiesz gdzie je stawiać.<br /><br />
                        (Do zaznaczania na mapie nie trzeba nic usuwać, można skopiować kordy razem z ilością i zadziała)
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                <div>
                    <div className="flex items-center mb-2">
                        <Label htmlFor="allNobles" className="text-lg font-medium mr-2">Wszystkie Szlachcice</Label>
                        <Button onClick={() => copyToClipboard(formatData(allNobles), 'allNobles')} variant="outline">
                            {buttonText.allNobles}
                        </Button>
                    </div>
                    <Textarea
                        rows={10}
                        className="w-full border border-gray-300 rounded-md p-2"
                        value={formatData(allNobles)}
                        readOnly
                        id="allNobles"
                    />
                </div>
                <div>
                    <div className="flex items-center mb-2">
                        <Label htmlFor="offs" className="text-lg font-medium mr-2">Offy</Label>
                        <Button onClick={() => copyToClipboard(formatData(offs, false), 'offs')} variant="outline">
                            {buttonText.offs}
                        </Button>
                    </div>
                    <Textarea
                        rows={10}
                        className="w-full border border-gray-300 rounded-md p-2"
                        value={formatData(offs, false)}
                        readOnly
                        id="offs"
                    />
                </div>
            </div>
        </div>
    )
}
