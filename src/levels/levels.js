//TODO level-generators
// https://github.com/AnoXDD/sokoban-generator-javascript
// https://github.com/AlliBalliBaba/Sokoban-Level-Generator
//https://news.ycombinator.com/item?id=22102297
//https://www.npmjs.com/package/sokoban-generator
//solvers
// https://www.cs.huji.ac.il/w~ai/projects/2012/SokobanWP/files/report.pdf
// https://worksheets.codalab.org/worksheets/0x2412ae8944eb449db74ce9bc0b9463fe/
//https://timallanwheeler.com/blog/2022/01/19/basic-search-algorithms-on-sokoban/
//https://healeycodes.com/building-and-solving-sokoban
//https://github.com/healeycodes/sokoban/blob/main/game/solver.ts
//https://orbi.uliege.be/bitstream/2268/5895/1/bnaic2008.pdf
//https://www.sciencedirect.com/science/article/pii/S0925772199000176
//TODO when final images are in place, remove all thumbnail and replace with snapshots...
//Or have an import like this (import thumbnail from '../assets/levels/thumbnail.png';) to each level
// @ts-nocheck
import thumbnail from '../assets/levels/thumbnail.png';
import { LongTermStore } from '@/store/long-term-store';
import * as testMap from '../assets/levels/test.json';
import { configuration } from "@/constants/configuration";
export const getEnabledLevels = () => {
    const numberOfEnabledLevels = LongTermStore.getNumberOfEnabledLevels();
    return getAllLevels()
        .filter((_, index) => index < numberOfEnabledLevels);
};
//https://github.com/ianormy/PythonistaSokoban/blob/main/boxban_levels.txt
//http://www.games4brains.de/sokoban-leveldesign.php
//http://www.game-sokoban.com/index.php?mode=catalog
//http://www.abelmartin.com/rj/sokoban_colecciones.html
//http://sneezingtiger.com/sokoban/levels/minicosmosText.html
// @ts-nocheck
export const getAllLevels = () => [
    LongTermStore.getCustomLevel(),
    {
        map: `2-3#|2-#.#
2-# 4#
3#$ $.#
#.$ @3#
4#$#
3-#.#
3-3#
`,
        title: 'Baby welcome',
        "thumbnailPath": thumbnail
    }, {
        map: `
4-3#
5#[$ds]##
#@$[rwo][.o]o #
# $[rwo][.o]o #
# $[rwo][.o]o #
# $[rwo][.o]o #
# $[rwo][.o]o #
# $[rwo][.o]o #
5#[.us]##
4-3#
`,
        title: 'every fool can see',
        "thumbnailPath": '/nuclear-defender/src/assets/levels/thumbnail.png'
    },
    testMap,
    {
        map: `
6-3#
7#ds#
#5 rw[.o]#
# $ $ #[.o]#
3#@###[.o]#
-2# $oout#
-# $ #o.#
-#   ####
-#####
`,
        title: 'Shoe on', //boxesLine = 14
    }, {
        map: `
10#
#. #ds4 #
# .$  $  #
#   $#.  #
## #rs[.o]o$@#
#  ###$###
# .$  oo.#
10#
`,
        title: 'Minidevotron poket', //7000000 iterations, 8minutes
    }, {
        map: `
--####
--#  #
--#  #
### *###
#      #
# .*** #
## $  ##
-##* ##
--#@  #
--# # #
--#   #
--#####
`,
        title: 'tony middle finger'
    }, {
        map: `
5-5#
5-# ds[$ls]#
7#[@o]##
#[$rt]4o[.rwo][dt]#
#[.o]5#[dwo]#
#o#---#o#
#o#---#o#
#o#---#o#
#o#---#o#
#o5#[.o]#
#[$ut][.o]4o[$lt]#
9#
`,
        title: 'adventure time',
    }, {
        map: `
10#
#   .@#  #
#  $#  $ #
## .###  #
###$ .#$ #
#   #  $ #
#   .  #.#
10#
`,
        title: 'Single Snikers', //boxesLine = 15
    }, {
        map: `
6-3#
7#[$dt]#
#  dt  #[$dt]#
# . .lt#[$dt]#
### ###[$dt]#
-## .o[@o]ls#
-# . #  #
-#   ####
-5#
`,
        title: 'Ahituna salad', //boxesLine = 11
    },
    {
        map: `
-7#
-#5 3#
2#$3#3 #
#3 $2 $ #
# +.# $ 2#
2#..#3 #
-8#
`,
        title: 'Family time', //euclidian: 340213, manhattan: {Steps: 117. Total time: 74385; iterations: 66774}
    },
    //                               Steps: 117, Total time: 85162; iterations: 77175; boxesLine = 17
    {
        map: `
4#|#  #
#  ######
#   $@. #
# $#$#. #
#   $   #
# ####  #
# ..    #
#########
`,
        title: 'whole small world', //euclidian: {Steps: 126. Total time: 242789; iterations: 231330}, manhattan: actions: Steps(130), iterations: 221890, totalTime: 242230
    },
    {
        map: `
-6#
##  @ ##
# $ $$ #
#......#
# $$ $ #
3# ut3#
--4#
`,
        title: 'fish memories', //euclidian: {Steps: 66. Total time: 228998; iterations: 216575}, manhattan: {Steps: 66. Total time: 227213; iterations: 216575}, boxesLine = 19
    },
    {
        map: `
###-####
#@###  #
# $..$ #
# $#.  #
# $..$ #
# $..$ #
# #us## #
8#
`,
        title: 'Oldschool punk'
    },
    {
        map: `
####----####
#   #--#   #
# *  ## $* #
# $.  .$.  #
-# $.$#.  #
--#.# @$ #
--# $  #.#
-#  .#$.$ #
#  .$.  .$ #
# *$ ##  * #
#   #--#   #
####----####
`,
        title: 'xman resume'
    },
    {
        map: `
     ##
   ##..##
  #. $ $ #
 #  $  $ .#
 #$$##*#$ #
#.  *.+# $.#
#.$ #..*  .#
 # $#*##$$#
 #. $  $  #
  # $ $ .#
   ##..##
     ##
`,
        title: 'medfest crazy night'
    },
    {
        map: `
 ##########
##   #    ##
#  #.  .#  #
# # . #. # #
# $$* $*$$ #
#   #* .  ##
##  . *#   #
# $$*$ *$$ #
# # .# . # #
#  #.  .#@ #
##    #   ##
 ##########
`,
        title: 'english muffin potato'
    },
    {
        map: `
############
#          #----####
# ######## ######  #
# ##     #         #
# ## ###   ######$ #
# ## #-## $   $   ##
# ## #--#  ##### ##
# ## #-##   $ $  #
# ## ### $ ## @ ##
# # $ ##  #######
# $   ...**.#
########....#
-------######
`,
        title: 'vodka selfsteem'
    },
    {
        map: `
###########
#         #
# $$.$$.$ #
# $.$..$. #
# $..$$.$ #
# $.*+.$. #
# .$....$ #
# $.$$.$. #
# $$..$.$ #
#         #
###########
`,
        title: 'isnt it chaotic'
    }, {
        map: `
---####
####  #
# $.*.#
# ## .#
#    .####
### $$   #
--#$     #
--#@###  #
--### ####
`,
        title: 'snoopy light bulb'
    }, {
        map: `
#######
# .$  #
#.    #
#.  ###
#.# ###
#.# $@#
#  $$ #
##$#  #
 #    #
 ######
`,
        title: 'bee hive behavior'
    }, {
        map: `
--#######
--#  .*@#
###  $$ #
#  $ # ####
#    # $ .#
####..  ###
---######
`,
        title: 'wooden icecream'
    }, {
        map: `
###########
#.. @#    #
##  $$  $ #
###  $$ # #
#...  #   #
###########
`,
        title: 'eminems suitcase'
    }, {
        map: `
    #####
#####@  #
#   $$$ #
#..**. ##
#      #
########
`,
        title: 'groundbreak rules'
    }, {
        map: `
 #######
 # .   ##
 #  $   #
####$ *.#
#@$ .   #
#########
`,
        title: 'daredevil microphone'
    }, {
        map: `
######
#@#  #
#$#  #
# $  #
#.*  #
# * ##
# .  #
##   #
 #####
`,
        title: 'young child singer'
    }, {
        map: `
########
# .... #
#  $@$ #
#####  ###
 ###     #
 #     $ #
 #   ##$ #
 ######  #
      ####
`,
        title: 'one eye phantom'
    }, {
        map: `
-######
-#.   ##
#### $.#
#@$  #.#
# $$   #
#. #   #
########
`,
        title: 'pacman red enemy'
    }, {
        map: `
######
#... #
# #. ##
#   $ #
#$$$  #
#@ #  #
#######
`,
        title: 'sour green tea'
    }, {
        map: `
--###--###
###ds####[.o]#
# $o[rwo]dt##[.o]#
#  $#[$o]##[.o]#
# @   [$o]o[.ut]#
##### ####
----###
`,
        title: 'vida loka aunt'
    }, {
        map: `
--#####
--#   #
### #dw##
#  ... #
#rt$$ $ #
#ut@#####
####
`,
        title: 'rocker science'
    }, {
        map: `
------####
------#  #
####### .##
#  ##   ..#
#@$   $$  #
####   ####
---#####
`,
        title: 'ambulance call'
    }, {
        map: `
##### ####
#   ###  #
#     $@ #
## $#$   #
#...#   ##
#########
`,
        title: 'coke tail'
    }, {
        map: `
 ####
 #  ####
 #     #
## #.  #
# * #*##
# $  * #
# # @  #
#   ####
#####
`,
        title: 'houston situation'
    }, {
        map: `
  #####
###@  #
# $*#$##
# #  . #
# . $# #
## #.  #
 #    ##
 ###  #
   ####
`,
        title: 'brazilian home kitchen'
    }, {
        map: `
#####
#   ####
#  $$  #
##.@ . #
-#. #.##
-# $$ #
-#  ###
-####
`,
        title: 'middle west texas'
    }, {
        map: `
#####
#. .#####
#  .    #
##$$@$  #
## ######
#  $ ##
#   . #
###   #
  #####
`,
        title: 'hospital prayers'
    }, {
        map: `
  ####
 ##  #
 #   ####
##$ ..*.#
# $  #$ #
#    #@ #
#########
`,
        title: 'church time'
    }, {
        map: `
 #####
##   #
#  # ###
# # *  #
# #  #@#
#   *  #
### *$##
  # . #
  #####
`,
        title: 'alternative portugal flag'
    }, {
        map: `
  ########
  #   #  #
  # . $. #
  # . $. #
 ###$##  #
 #.. ##$##
## $*$   #
#  * #   #
#  @.#####
##   #
 #####
`,
        title: 'formula one justice'
    }, {
        map: `
 #######
 #  #  #
 #$.@.$#
 # .#. #
##$.#.$##
# $   $ #
#   #   #
#########
`,
        title: 'left business'
    }, {
        map: `
 #####
##  .#
# $#.##
#     #
##$   #
#  #*##
# @  #
#  ###
####
`,
        title: 'eastern island mistery'
    }, {
        map: `
--#####
###   ##
# .. . #
# $$ # #
## #$$ #
-#.@  ##
-###  #
---####
`,
        title: 'run forrest'
    }, {
        map: `
--#####
###   #
#   #.##
#  *$@ #
## * **##
-# # #  #
-#      #
-###  ###
---####
`,
        title: 'beauty saloon hair'
    }, {
        map: `
########
#   #  #
#      #
## #.$.#
#  $@###
# #$*.#
# # # #
#     #
##   ##
-#####
`,
        title: 'kharma chameleon'
    }, {
        "title": "mr. lonely",
        "map": "--####\n###[$ds][.o]##\n#dt[$o][@o]o[.ls]#\n#o[$o]oo[.]#\n#rto[$o]##\n##[o.]lt#\n-####\n",
    },
    {
        map: `
----####
---## .#
--## . #
-##rto..#
## [$o][$o]o##
#@$ ols##
# $  ##
#  ###
####
`,
        title: 'driving license'
    }, {
        map: `
-----####
--####@ #
--#.* $ #
###   # ##
#    #.. #
#    $ $ #
####  ####
---####
`,
        title: 'baby got another'
    }
];
