import React, { useState, useEffect } from "react";
import { fetchCharacters, addCharacter } from "./api";
import SquareImage from "./squareImage";
import { Character } from "./types";

const EnterCharacter: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [series, setSeries] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    const getCharacters = async () => {
      const fetchedCharacters: Character[] = await fetchCharacters();
      setCharacters(fetchedCharacters);
    };
    getCharacters();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newCharacter: Character = {
      name,
      series,
      imageUrl,
      tags,
      rankings: []  // Initialize empty rankings array
    };
    const savedCharacter: Character = await addCharacter(newCharacter);
    setCharacters([...characters, savedCharacter]);
    setName("");
    setSeries("");
    setImageUrl("");
    setTags([]);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        JCo and Beike Character Tier Ranking
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="block">
            Enter Character Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="series" className="block">
            Enter Character Series
          </label>
          <input
            type="text"
            name="series"
            id="series"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="imageUrl" className="block">
            Enter Image URL
          </label>
          <input
            type="url"
            name="imageUrl"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>

        {/* Tag Input Section */}
        <div className="space-y-2">
          <label htmlFor="tags" className="block">
            Add Tags
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="tags"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1 border rounded p-2"
              placeholder="Enter a tag"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Tag
            </button>
          </div>

          {/* Tag Display */}
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded w-full"
        >
          Add Character
        </button>
      </form>

      <h2 className="text-xl font-bold mt-8 mb-4">Character List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {characters.map((character) => (
          <div key={character.id} className="border rounded p-4">
            <p className="font-bold">Name: {character.name}</p>
            <p className="text-gray-600">Series: {character.series}</p>
            {character.tags && character.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 my-2">
                {character.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-200 px-2 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <SquareImage imageUrl={character.imageUrl} size={200} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnterCharacter;
