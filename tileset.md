https://www.youtube.com/watch?v=b-beyJCCutQ

# Tiles

### Adicionar sombras

1. Target (pedra radioativa. cor choque: #d4fa00)
2. Box (meio transparente)
3. Box on target (cor diferente) (nada mais é do que o 2 em cima do 1)
4. Player standing (front facing)
5. Player standing on target (front facing) (nada mais é do que o 4 em cima do 1)
6. Player walking (3 frames x4 directions)(esq e direita são espelhadas)
7. Player pushing (3 frames x4 directions)(esq e direita são espelhadas)
9. Wall (13)
    - 1 | 2 | 3
    - 4 | 5 | 6
    - 7 | 8 | 9
    - ===========
    - x  | x  | x
    - 10 | 11 | 12
    - x  | x  | x
    - ===========
    - x | x  | x
    - x | 13 | x
    - x | x  | x
10. Treadmill (3x frames em movimento)
11. Spring (3x directions, horizontal, upfacing, downfacing)(3 states: compressed, 50% compressed, relaxed)
12. Sliding floor (chão polido)
13. One way door (3x directions: horizontal, upfacing, downfacing)(3 states: closed, 50% open, open)


1. Chão é uma imagem separada 200x200

## Perspectiva

Quero uma perspectiva. Mas não muita. Quase 100% ortogonal, só um pouquinho menos pra ficar mais bonito. Tipo um ângulo
de 80 graus. Se precisar aumentar um pouco a altura das tiles pra isso. Pode ser. Tipo 45, onde 5 é perspectiva e 40 é a
visão de cima.
Olha essa aqui: https://gamemedia.armorgames.com/19073/icn_heroimage.png. Bem legal, mas eu quero um pouco menos do que
essa ainda.

## Tema

Pensei no tema parecido com uma usina nuclear.
Inclusive, tou usando essa cor para vários aspectos da hud: '#d4fa00'. Essa outra também tá na minha paleta: '#dddddd'
Esse estilo aqui me agrada bastante
https://www3.minijuegosgratis.com/v3/games/thumbnails/2191_1.jpg

## Chão

4 tiles que se combinam entre si. Ou seja, se eu substituir uma por qualquer outra não vai ficar "feio".

# Wall

13 tiles diferentes que vão ser dispostas a depender da quantidade de paredes em volta. Por exemplo, o chão 13 só vai
ser colocado quando não houver nenhum chão ao redor e chão 5 quando tiver 4 chãos ao redor. O 9 quando a tile tiver um
chão acima e outro a esquerda. E assim vai.

