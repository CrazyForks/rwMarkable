import { EMOJIS } from "@/app/_consts/emojis";

const getSingular = (word: string): string => {
  if (word.endsWith("ies")) {
    return word.slice(0, -3) + "y";
  }
  if (word.endsWith("es")) {
    return word.slice(0, -2);
  }
  if (word.endsWith("s")) {
    return word.slice(0, -1);
  }
  return word;
}

const getWordVariations = (word: string): string[] => {
  const variations = [
    word.toLowerCase(),
    getSingular(word.toLowerCase()),
    word.toLowerCase().replace(/[^a-z]/g, ""),
  ];

  return variations.filter((v, i, a) => a.indexOf(v) === i);
}

export const findMatchingEmoji = (text: string): string => {
  const emojiDict = EMOJIS;

  const words = text.split(/\s+/);
  const allWordVariations = words.map(getWordVariations).flat();

  for (const word of allWordVariations) {
    const emoji = emojiDict[word];
    if (emoji) {
      return emoji;
    }
  }

  for (const [key, emoji] of Object.entries(emojiDict)) {
    for (const word of allWordVariations) {
      if (
        word.length >= 3 &&
        (key === word ||
          key.startsWith(word + " ") ||
          key.endsWith(" " + word) ||
          key.includes(" " + word + " "))
      ) {
        return emoji;
      }
    }
  }

  for (const word of allWordVariations) {
    if (word.length > 5) {
      for (const [key, emoji] of Object.entries(emojiDict)) {
        if (word.includes(key) && key.length > 3) {
          return emoji;
        }
      }
    }
  }

  return "";
}
