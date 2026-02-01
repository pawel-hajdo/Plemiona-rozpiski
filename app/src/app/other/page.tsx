"use client"
import { useEffect, useState } from "react";
import { getPlayerId } from "@/lib/utils";
import { getSourceVillagesByType, getSittingsSourceVillagesByType } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {VillageData, SittingVillageData} from "@/lib/types";

type PlayerData = {
    allNobles: VillageData[];
    offs: VillageData[];
};
type WorldData = Record<string, PlayerData>;
type GroupedData = Record<string, WorldData>;
type ButtonTextState = Record<string, string>;

export default function Other() {
    const [groupedData, setGroupedData] = useState<GroupedData>({});
    const [buttonText, setButtonText] = useState<ButtonTextState>({});
    const playerId = getPlayerId();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    noblesData1,
                    noblesData2,
                    nobleTrainData,
                    offsData,
                    sittingNoblesData1,
                    sittingNoblesData2,
                    sittingNobleTrainData,
                    sittingOffsData
                ]: [
                    VillageData[],
                    VillageData[],
                    VillageData[],
                    VillageData[],
                    SittingVillageData[],
                    SittingVillageData[],
                    SittingVillageData[],
                    SittingVillageData[]
                ] = await Promise.all([
                    getSourceVillagesByType(playerId, 'SZLACHCIC'),
                    getSourceVillagesByType(playerId, 'Gruby'),
                    getSourceVillagesByType(playerId, 'Kareta'),
                    getSourceVillagesByType(playerId, 'OFF'),
                    getSittingsSourceVillagesByType(playerId, 'SZLACHCIC'),
                    getSittingsSourceVillagesByType(playerId, 'Gruby'),
                    getSittingsSourceVillagesByType(playerId, 'Kareta'),
                    getSittingsSourceVillagesByType(playerId, 'OFF')
                ]);

                const multipliedNobleTrainData = nobleTrainData.map(item => ({
                    ...item,
                    count: item.count * 4
                }));

                const multipliedSittingNobleTrainData = sittingNobleTrainData.map(item => ({
                    ...item,
                    count: item.count * 4
                }));

                const mergedNobles = mergeAndSumData([...noblesData1, ...noblesData2, ...multipliedNobleTrainData]);
                const mergedSittingNobles = mergeAndSumSittingData([...sittingNoblesData1, ...sittingNoblesData2, ...multipliedSittingNobleTrainData]);
                const grouped = groupDataByWorldAndPlayer(mergedNobles, offsData, mergedSittingNobles, sittingOffsData, playerId);
                setGroupedData(grouped);

                const initialButtonText: ButtonTextState = {};
                Object.entries(grouped).forEach(([world, players]) => {
                    Object.keys(players).forEach(playerName => {
                        initialButtonText[`allNobles-${world}-${playerName}`] = "Kopiuj do schowka";
                        initialButtonText[`offs-${world}-${playerName}`] = "Kopiuj do schowka";
                    });
                });
                setButtonText(initialButtonText);

            } catch (error) {
                console.error("Błąd podczas pobierania danych:", error);
            }
        };

        fetchData();
    }, []);

    const groupDataByWorldAndPlayer = (
        nobles: VillageData[],
        offs: VillageData[],
        sittingNobles: SittingVillageData[],
        sittingOffs: SittingVillageData[],
        currentPlayerId: string
    ): GroupedData => {
        const grouped: GroupedData = {};

        // Dodaj dane aktualnego gracza
        [...nobles, ...offs].forEach(item => {
            const { world } = item;
            if (!grouped[world]) {
                grouped[world] = {};
            }
            if (!grouped[world][""]) {
                grouped[world][""] = { allNobles: [], offs: [] };
            }
            if (nobles.includes(item)) {
                grouped[world][""].allNobles.push(item);
            } else {
                grouped[world][""].offs.push(item);
            }
        });

        // Dodaj dane graczy na zastępstwie
        [...sittingNobles, ...sittingOffs].forEach(item => {
            const { world, playerName } = item;
            if (!grouped[world]) {
                grouped[world] = {};
            }
            if (!grouped[world][playerName]) {
                grouped[world][playerName] = { allNobles: [], offs: [] };
            }
            if (sittingNobles.includes(item)) {
                grouped[world][playerName].allNobles.push(item);
            } else {
                grouped[world][playerName].offs.push(item);
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

    const mergeAndSumSittingData = (data: SittingVillageData[]): SittingVillageData[] => {
        const resultMap = data.reduce((acc: Record<string, SittingVillageData>, item) => {
            const key = `${item.source}-${item.playerName}`;
            if (acc[key]) {
                acc[key].count += item.count;
            } else {
                acc[key] = { ...item };
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
                        Poniżej znajduje się lista kordów (Twoich wiosek i wiosek graczy na których masz zastępstwo) z których są rozpisane ataki danego typu (offy, grube itd).<br /><br />
                        Możesz ją wykorzystać np. do wklejenia na mapie w plemionach, gdy potrzebujesz sprawdzić czy masz jakieś nierozpisane offy
                        albo żeby sprawdzić ile grubych masz do wysłania z danej wioski.<br /><br />
                        (Do zaznaczania na mapie nie trzeba nic usuwać, można skopiować kordy razem z ilością i zadziała)
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {Object.entries(groupedData).map(([world, players]) => (
                <div key={world} className="mt-6">
                    <h2 className="text-xl font-semibold">Świat {world}</h2>

                    {Object.entries(players).map(([playerName, { allNobles, offs }]) => (
                        <div key={`${world}-${playerName}`} className="mt-4">
                            <h3 className="text-xl font-semibold mb-3">{playerName}</h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <div className="flex items-center mb-2">
                                        <Label htmlFor={`allNobles-${world}-${playerName}`} className="text-lg font-medium mr-2">
                                            Wszystkie Szlachcice
                                        </Label>
                                        <Button 
                                            onClick={() => copyToClipboard(formatData(allNobles), `allNobles-${world}-${playerName}`)} 
                                            variant="outline"
                                        >
                                            {buttonText[`allNobles-${world}-${playerName}`]}
                                        </Button>
                                    </div>
                                    <Textarea
                                        rows={10}
                                        className="w-full border border-gray-300 rounded-md p-2"
                                        value={formatData(allNobles)}
                                        readOnly
                                        id={`allNobles-${world}-${playerName}`}
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center mb-2">
                                        <Label htmlFor={`offs-${world}-${playerName}`} className="text-lg font-medium mr-2">
                                            Offy
                                        </Label>
                                        <Button 
                                            onClick={() => copyToClipboard(formatData(offs, false), `offs-${world}-${playerName}`)} 
                                            variant="outline"
                                        >
                                            {buttonText[`offs-${world}-${playerName}`]}
                                        </Button>
                                    </div>
                                    <Textarea
                                        rows={10}
                                        className="w-full border border-gray-300 rounded-md p-2"
                                        value={formatData(offs, false)}
                                        readOnly
                                        id={`offs-${world}-${playerName}`}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
