"use client";
import * as React from "react";
import { useState } from "react";
import { deleteVillagesAdmin } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

interface PageProps {
  params: {
    world: string;
  };
}

export default function DeleteVillagesPage({ params }: PageProps) {
  const [villages, setVillages] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

    const extractVillages = (input: string): string[] => {
        return input
            .split(/\s+/) // rozdziela po spacjach i enterach
            .map(v => v.trim())
            .filter(v => /^\d{1,3}\|\d{1,3}$/.test(v)); // format xxx|yyy
    };

    const handleDelete = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError("");
            setSuccess(false);

            const targetVillages = extractVillages(villages)

            if (targetVillages.length === 0) {
                setError("Podaj przynajmniej jedne poprawne kordy wioski");
                return;
            }

            await deleteVillagesAdmin(targetVillages, params.world);
            setSuccess(true);
            setVillages("");
        } catch (err) {
            console.error("Błąd podczas usuwania wiosek:", err);
            if (err instanceof Error) {
            if (err.message.includes("Access denied")) {
                setError("Brak uprawnień administratora");
            } else if (err.message.includes("Authentication required")) {
                router.push("/login");
                return;
            } else {
                setError("Błąd podczas usuwania wiosek");
            }
            } else {
                setError("Nieznany błąd");
            }
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <div className="p-2 sm:p-8">
        <form onSubmit={handleDelete} className="space-y-4 shadow-md">
            <div>
                <Label htmlFor="villages" className="block mb-2">
                    Wprowadź wioski do usunięcia, po spacji lub w osobnych liniach.
                    Operacja jest nieodwracalna!
                </Label>
                <Textarea
                    id="villages"
                    value={villages}
                    onChange={(e) => setVillages(e.target.value)}
                    rows={6}
                    className="w-full"
                    placeholder={`123|456 \n234|567`}
                />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {success && (
            <p className="text-green-500 mt-4">
            Wioski zostały pomyślnie usunięte.
            </p>
             )}
            <Button type="submit" disabled={isLoading}>
                {isLoading ? "Usuwanie..." : "Usuń wioski"}
            </Button>
        </form>
    </div>
  );
}
