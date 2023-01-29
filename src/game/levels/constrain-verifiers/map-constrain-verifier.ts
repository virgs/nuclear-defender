import type {ProcessedMap} from '@/game/levels/sokoban-map-stripper';

export interface MapConstrainVerifier {
    verify(output: ProcessedMap): void;
}