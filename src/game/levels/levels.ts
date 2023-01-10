// All credits to:
// Title: Aruba7
// Description: Lucky set no.7
// Author: Eric F Tchong
// Email: serenata@setarnet.aw

//TODO add thumbnail?
//show tem as a carrousel instead of a dropdown?

type Level = {
    title: string,
    map: string,
    solution?: {
        moves: string,
        iterationsToFind: number //sort by iterationsToFind to determine level order?
    }
};
export const levels: Level[] = [
    {
        map: `
5-#####
#5#ds#ds##
#5rto2rtls##
#ut[$ds]  [.]o4 #
#ut[$rs]@ rso2   #
#ut2 ooo [$rs]$[$ls]#
#utuw o o    #
#ut2 ooo    #
#ut4 o 3 #
#ut3lt*o4 #
#5#us5#
5-###
`,
        title: 'Test',
    }, {
        map: `
2-3#|2-#.#
2-# 4#
3#$ $.#
#.$ @3#
4#$#
3-#.#
3-3#
`,
        title: 'Welcome',
    }, {
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
        title: 'Shoe on',
    },{
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
        title: 'Devotron',
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
        title: 'Snikers',
    },{
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
        title: 'Ahituna',
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
        title: 'Are you familiar?', //euclidian: 340213, manhattan: {Steps: 117. Total time: 74385; iterations: 66774}
    },                              //                   manhattan: {Steps: 117. Total time: 96172; iterations: 88084}
                                    //                               Steps: 117, Total time: 85162; iterations: 77175
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
        title: 'Small world', //euclidian: {Steps: 126. Total time: 242789; iterations: 231330}, manhattan: actions: Steps(130), iterations: 221890, totalTime: 242230
    },      //                                          Total time: 272507; iterations: 233424
    {
        map: `
-6#
##  @ ##
# $ $$ #
#......#
# $$ $ #
3#  3#
--4#
`,
        title: 'Memories', //euclidian: {Steps: 66. Total time: 228998; iterations: 216575}, manhattan: {Steps: 66. Total time: 227213; iterations: 216575}
    },
    {
        map: `
8#
#@###  #
# $..$ #
# $#.  #
# $..$ #
# $..$ #
# #us## #
8#
`,
        title: 'Oldschool'
    }];