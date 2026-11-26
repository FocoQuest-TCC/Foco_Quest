import styles from './styles/inv.module.css';
import { characters, resolveCharacterId, type CharacterId } from '../config/characters';

interface InvProps {
  ownedCharacterIds: CharacterId[];
  equippedCharacterId: string | null;
  characterError?: string;
  isSavingCharacter: boolean;
  onSelectCharacter: (characterId: CharacterId) => void;
}

export function Inv({
  ownedCharacterIds,
  equippedCharacterId,
  characterError,
  isSavingCharacter,
  onSelectCharacter,
}: InvProps) {

    const equippedId = resolveCharacterId(equippedCharacterId);
    const ownedCharacters = characters.filter(character => ownedCharacterIds.includes(character.id));

    return(
        <section className={styles.container} aria-labelledby='inv-heading'>
            <h2 id='inv-heading' className={styles.title}>INVENTÁRIO DO HERÓI</h2>
            <section className={styles.charactersSection} aria-labelledby="owned-characters-heading">
                <h3 id="owned-characters-heading" className={styles.charactersTitle}>PERSONAGENS DESBLOQUEADOS</h3>
                <p>Um novo personagem é desbloqueado a cada cinco níveis máximos alcançados.</p>
                {characterError && <p className={styles.characterError} role="alert">{characterError}</p>}
                <div className={styles.characterGrid}>
                    {ownedCharacters.map(character => {
                        const isEquipped = equippedId === character.id;
                        return (
                            <button
                                key={character.id}
                                type="button"
                                className={`${styles.characterCard} ${isEquipped ? styles.characterEquipped : ''}`}
                                onClick={() => onSelectCharacter(character.id)}
                                disabled={isSavingCharacter || isEquipped}
                                aria-pressed={isEquipped}
                            >
                                <img src={character.image} alt="" className={styles.characterPhoto}/>
                                <span className={styles.characterName}>{character.name}</span>
                                <span className={styles.characterStatus}>
                                    {isEquipped ? 'EQUIPADO' : isSavingCharacter ? 'SALVANDO...' : 'EQUIPAR'}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>
        </section>
    );
};