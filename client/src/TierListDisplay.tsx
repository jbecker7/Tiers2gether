import React, { useState, useEffect } from "react";
import { TierBoard, Character, CharacterRanking } from "./types";

interface TierListDisplayProps {
  characters: TierBoard["characters"];
  userId: string;
  onCharacterDrop: (
    characterId: string,
    tier: "S" | "A" | "B" | "C" | "D",
  ) => void;
}

const TIERS = ["S", "A", "B", "C", "D"] as const;

const TierListDisplay: React.FC<TierListDisplayProps> = ({
  characters,
  userId,
  onCharacterDrop,
}) => {
  // Get unique list of users who have made rankings
  const [selectedUser, setSelectedUser] = useState<string>(userId);
  const [usersWithRankings, setUsersWithRankings] = useState<string[]>([]);

  useEffect(() => {
    const users = new Set<string>();
    Object.values(characters).forEach((character) => {
      character.rankings.forEach((ranking) => {
        users.add(ranking.userId);
      });
    });
    setUsersWithRankings(Array.from(users));
  }, [characters]);

  const charactersByTier = Object.entries(characters).reduce(
    (acc, [id, character]) => {
      const userRanking = character.rankings.find(
        (r) => r.userId === selectedUser,
      );
      const tier = userRanking?.tier || "D";
      if (!acc[tier]) acc[tier] = [];
      acc[tier].push({ id, ...character });
      return acc;
    },
    {} as Record<string, (Character & { id: string })[]>,
  );

  const isViewingOwnRankings = selectedUser === userId;

  const renderCharacterCard = (character: Character & { id: string }) => (
    <div
      key={character.id}
      className={`character-card ${
        !isViewingOwnRankings ? "non-draggable" : ""
      }`}
      draggable={isViewingOwnRankings}
      onDragStart={(e) => {
        if (!isViewingOwnRankings) return;
        e.dataTransfer.setData("characterId", character.id);
        e.currentTarget.classList.add("is-dragging");
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove("is-dragging");
      }}
    >
      <img
        src={character.imageUrl}
        alt={character.name}
        className="character-image"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "https://placehold.co/200x200?text=No+Image";
        }}
      />
      <div className="character-info">
        <div className="character-name">{character.name}</div>
        <div className="character-series">{character.series}</div>
        {character.tags && character.tags.length > 0 && (
          <div className="character-tags">
            {character.tags.map((tag) => (
              <span key={tag} className="character-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="tier-list">
      <div className="tier-list-header">
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="user-select"
        >
          {usersWithRankings.map((user) => (
            <option key={user} value={user}>
              {user === userId ? "Your Rankings" : `${user}'s Rankings`}
            </option>
          ))}
        </select>
        {!isViewingOwnRankings && (
          <div className="viewing-other-user">
            Viewing {selectedUser}'s rankings (read-only)
          </div>
        )}
      </div>
      {TIERS.map((tier) => (
        <div key={tier} className="tier-row">
          <div className={`tier-label tier-${tier}`}>{tier}</div>
          <div
            className={`tier-content ${
              isViewingOwnRankings ? "droppable" : ""
            }`}
            onDragOver={(e) => {
              if (!isViewingOwnRankings) return;
              e.preventDefault();
              e.currentTarget.classList.add("can-drop");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("can-drop");
            }}
            onDrop={(e) => {
              if (!isViewingOwnRankings) return;
              e.preventDefault();
              e.currentTarget.classList.remove("can-drop");
              const characterId = e.dataTransfer.getData("characterId");
              if (characterId) {
                onCharacterDrop(characterId, tier);
              }
            }}
          >
            <div className="character-grid">
              {charactersByTier[tier]?.map((character) =>
                renderCharacterCard(character),
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TierListDisplay;
