import React from "react";
import { BoardCharacter } from "./types";

interface TierListDisplayProps {
  characters: { [key: string]: BoardCharacter };
  userId: string;
  onCharacterDrop: (
    characterId: string,
    newTier: "S" | "A" | "B" | "C" | "D"
  ) => void;
}

const TIERS = ["S", "A", "B", "C", "D"] as const;
const TIER_COLORS = {
  S: "bg-[#FF9999]",
  A: "bg-[#FFCC99]",
  B: "bg-[#FFEB99]",
  C: "bg-[#FFFF99]",
  D: "bg-[#CCFF99]",
} as const;

const TierListDisplay: React.FC<TierListDisplayProps> = ({
  characters,
  userId,
  onCharacterDrop,
}) => {
  // Group characters by tier
  const charactersByTier = Object.entries(characters).reduce(
    (acc, [id, char]) => {
      const userRanking = char.rankings?.find((r) => r.userId === userId);
      const tier = userRanking?.tier || "Unranked";
      if (!acc[tier]) acc[tier] = [];
      acc[tier].push({ id, ...char });
      return acc;
    },
    {} as Record<string | "Unranked", (BoardCharacter & { id: string })[]>
  );

  const renderCharacterCard = (
    character: BoardCharacter & { id: string },
    currentTier: string
  ) => (
    <div
      key={character.id}
      className="flex-shrink-0 w-28 bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
    >
      <img
        src={character.imageUrl}
        alt={character.name}
        className="w-full h-28 object-cover"
      />
      <div className="p-2">
        <p className="font-bold text-sm truncate">{character.name}</p>
        <p className="text-xs text-gray-600 truncate mb-2">
          {character.series}
        </p>
        <select
          value={currentTier === "Unranked" ? "" : currentTier}
          onChange={(e) =>
            onCharacterDrop(
              character.id,
              e.target.value as "S" | "A" | "B" | "C" | "D"
            )
          }
          className="w-full text-xs border rounded py-1 px-1"
        >
          {currentTier === "Unranked" && (
            <option value="" disabled>
              Select Tier
            </option>
          )}
          {TIERS.map((t) => (
            <option key={t} value={t}>
              {t} Tier
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-2 border border-[#333]">
      {/* Tier List */}
      {TIERS.map((tier) => (
        <div key={tier} className="flex h-[160px] border border-[#333]">
          <div
            className={`w-24 flex-shrink-0 flex items-center justify-center text-3xl font-bold ${TIER_COLORS[tier]}`}
          >
            {tier}
          </div>
          <div className="flex-1 bg-[#2a2a2a] p-4 overflow-x-auto">
            <div className="flex gap-4 h-full items-center">
              {charactersByTier[tier]?.map((character) =>
                renderCharacterCard(character, tier)
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Unranked Characters */}
      <div className="flex h-[160px] border border-[#333]">
        <div className="w-24 flex-shrink-0 flex items-center justify-center text-3xl font-bold bg-gray-300">
          New
        </div>
        <div className="flex-1 bg-[#2a2a2a] p-4 overflow-x-auto">
          <div className="flex gap-4 h-full items-center">
            {charactersByTier["Unranked"]?.map((character) =>
              renderCharacterCard(character, "Unranked")
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TierListDisplay;
