# Tiles

1. Target
2. Box
3. Box on target (nada mais é do que o 2 em cima do 1)
4. Player standing (front facing)
5. Player standing on target (front facing) (nada mais é do que o 4 em cima do 1)
6. Player walking (4 directions)
7. Player pushing (4 directions)
8. Floors (4)
    - 1 | 2
    - 3 | 4
9. Wall (13)
    - 1 | 2 | 3
    - 4 | 5 | 6
    - 7 | 8 | 9
    - ===========
    - 10 | 11 | 12
    - ===========
    - x | 13 | x
10. Treadmill
11. Spring (3x directions, horizontal, upfacing, downfacing)(3 states: compressed, 50% compressed, relaxed)
12. Sliding floor
13. One way door (2x directions: horizontal e vertical)

## Perspectiva

Quero uma perspectiva. Mas não muita. Quase 100% ortogonal, só um pouquinho menos pra ficar mais bonito. Tipo um ângulo
de 80 graus. Se precisar aumentar um pouco a altura das tiles pra isso. Pode ser. Tipo 45, onde 5 é perspectiva e 40 é a
visão de cima.
Olha essa aqui: https://gamemedia.armorgames.com/19073/icn_heroimage.png. Bem legal, mas eu quero um pouco menos do que
essa ainda.

## Tema

Pensei no tema parecido com uma usina nuclear.
Inclusive, tou usando essa cor para vários aspectos da hud: '#d4fa00'. Essa outra também tá na minha paleta: '#dddddd'
Esse estilo aqui me agrada bastante: https://www3.minijuegosgratis.com/v3/games/thumbnails/2191_1.jpg
https://www3.minijuegosgratis.com/v3/games/thumbnails/2191_1.jpg

## Chão

4 tiles que se combinam entre si. Ou seja, se eu substituir uma por qualquer outra não vai ficar "feio".

# Muros

13 tiles diferentes que vão ser dispostas a depender da quantidade de paredes em volta. Por exemplo, o chão 13 só vai
ser colocado quando não houver nenhum chão ao redor e chão 5 quando tiver 4 chãos ao redor. O 9 quando a tile tiver um
chão acima e outro a esquerda. E assim vai.

