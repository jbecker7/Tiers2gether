// TierListDisplay.tsx
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

  return (
    <div className="space-y-4">
      {/* Tier List */}
      {TIERS.map((tier) => (
        <div key={tier} className="flex">
          <div
            className={`w-24 flex items-center justify-center text-2xl font-bold ${TIER_COLORS[tier]} p-4`}
          >
            {tier}
          </div>
          <div className="flex-1 bg-[#2D2D2D] p-4">
            <div className="flex flex-wrap gap-4">
              {charactersByTier[tier]?.map((character) => (
                <div
                  key={character.id}
                  className="w-48 bg-white rounded-lg p-2"
                >
                  <img
                    src={character.imageUrl}
                    alt={character.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <div className="text-black">
                    <p className="font-bold truncate">{character.name}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {character.series}
                    </p>
                    <select
                      value={tier}
                      onChange={(e) =>
                        onCharacterDrop(
                          character.id,
                          e.target.value as "S" | "A" | "B" | "C" | "D"
                        )
                      }
                      className="mt-2 w-full border rounded px-2 py-1"
                    >
                      {TIERS.map((t) => (
                        <option key={t} value={t}>
                          {t} Tier
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Unranked Characters */}
      <div className="flex">
        <div className="w-24 flex items-center justify-center text-2xl font-bold bg-gray-300 p-4">
          Unranked
        </div>
        <div className="flex-1 bg-[#2D2D2D] p-4">
          <div className="flex flex-wrap gap-4">
            {charactersByTier["Unranked"]?.map((character) => (
              <div key={character.id} className="w-48 bg-white rounded-lg p-2">
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <div className="text-black">
                  <p className="font-bold truncate">{character.name}</p>
                  <p className="text-sm text-gray-600 truncate">
                    {character.series}
                  </p>
                  <select
                    value=""
                    onChange={(e) =>
                      onCharacterDrop(
                        character.id,
                        e.target.value as "S" | "A" | "B" | "C" | "D"
                      )
                    }
                    className="mt-2 w-full border rounded px-2 py-1"
                  >
                    <option value="" disabled>
                      Select Tier
                    </option>
                    {TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t} Tier
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TierListDisplay;
