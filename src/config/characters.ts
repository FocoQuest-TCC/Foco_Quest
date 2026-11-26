import feiticera from '../assets/Characters/Feiticera.png';
import homemBranco from '../assets/Characters/HomemBranco.png';
import homemPreto from '../assets/Characters/HomenPreto.png';
import illaoi from '../assets/Characters/Illaoi.png';
import jonnhy from '../assets/Characters/Jonnhy.png';
import kira from '../assets/Characters/Kira.png';
import lVerde from '../assets/Characters/L.Verde.png';
import maki from '../assets/Characters/Maki.png';
import manhunt from '../assets/Characters/Manhunt.png';
import mulherBranca from '../assets/Characters/MulherBranca.png';
import mulherPreta from '../assets/Characters/MulherPreta.png';
import saci from '../assets/Characters/Saci.png';
import simon from '../assets/Characters/Simon.png';
import thragg from '../assets/Characters/Thragg.png';
import uzui from '../assets/Characters/Uzui.png';

export const characters = [
  { id: 'homemBranco', name: 'Homem 1', image: homemBranco },
  { id: 'homemPreto', name: 'Homem 2', image: homemPreto },
  { id: 'mulherPreta', name: 'Mulher 1', image: mulherPreta },
  { id: 'mulherBranca', name: 'Mulher 2', image: mulherBranca },
  { id: 'feiticera', name: 'Feiticeira', image: feiticera },
  { id: 'illaoi', name: 'Illaoi', image: illaoi },
  { id: 'jonnhy', name: 'Jonnhy', image: jonnhy },
  { id: 'kira', name: 'Kira', image: kira },
  { id: 'lVerde', name: 'L. Verde', image: lVerde },
  { id: 'maki', name: 'Maki', image: maki },
  { id: 'manhunt', name: 'Manhunt', image: manhunt },
  { id: 'saci', name: 'Saci', image: saci },
  { id: 'simon', name: 'Simon', image: simon },
  { id: 'thragg', name: 'Thragg', image: thragg },
  { id: 'uzui', name: 'Uzui', image: uzui },
] as const;

export type CharacterId = typeof characters[number]['id'];

export const starterCharacters = characters.slice(0, 4);
export const unlockableCharacters = characters.slice(4);
export const starterCharacterIds = starterCharacters.map(character => character.id);

const legacyCharacterIds: Record<string, CharacterId> = {
  quemEele: 'homemBranco',
  gatoretardado: 'homemPreto',
  gatomaneiro: 'mulherPreta',
  gatolele: 'mulherBranca',
};

export function resolveCharacterId(characterId: string | null | undefined): CharacterId | undefined {
  if (!characterId) return undefined;
  return legacyCharacterIds[characterId]
    ?? characters.find(character => character.id === characterId)?.id;
}

export function getCharacterImage(characterId: string | null | undefined) {
  const resolvedId = resolveCharacterId(characterId);
  return characters.find(character => character.id === resolvedId)?.image;
}
