import quemEele from '../assets/Characters/quemEele.png';
import gatoRetardado from '../assets/Characters/gatoretardado.png';
import gatoManeiro from '../assets/Characters/gatomaneiro.png';
import gatoLele from '../assets/Characters/gatolele.png';

export const characters = [
  { id: 'quemEele', name: 'Gato Retardadi', image: quemEele },
  { id: 'gatoretardado', name: 'Gato Sem Aura', image: gatoRetardado },
  { id: 'gatomaneiro', name: 'Gato Ziguiriguidum', image: gatoManeiro },
  { id: 'gatolele', name: 'Gato Vesgo', image: gatoLele },
] as const;

export type CharacterId = typeof characters[number]['id'];

export function getCharacterImage(characterId: string | null | undefined) {
  return characters.find(character => character.id === characterId)?.image;
}
