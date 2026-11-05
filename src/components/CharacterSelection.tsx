import { characters, type CharacterId } from '../config/characters';
import styles from './CharacterSelection.module.css';

interface CharacterSelectionProps {
  disabled?: boolean;
  error?: string;
  onSelect: (characterId: CharacterId) => void;
}

export function CharacterSelection({ disabled = false, error, onSelect }: CharacterSelectionProps) {
  return (
    <section className={styles.selection} aria-labelledby="character-selection-title">
      <h2 id="character-selection-title">Escolha seu personagem</h2>
      <p>Selecione o herói que vai representar você no FocoQuest.</p>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.grid}>
        {characters.map(character => (
          <button
            className={styles.character}
            type="button"
            key={character.id}
            onClick={() => onSelect(character.id)}
            disabled={disabled}
          >
            <img src={character.image} alt="" />
            <span>{character.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
