import type {ProcessedMap} from '../../levels/sokoban-map-stripper';

export interface MapConstrainVerifier {
    verify(output: ProcessedMap): void;
}