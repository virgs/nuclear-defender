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
12#
#5#ds5#
#5 o4 #
#5 o4 #
#5 o4 #
#5 o$   #
#     o@.  #
#5 o*   #
#5 o4 #
#4 *o4 #
#5#us5#
12#
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
        title: 'Small world', //euclidian: {Steps: 126. Total time: 242789; iterations: 231330}, manhattan: 2511931
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
    }];                                                                                                //Steps: 66. Total time:  85661; iterations:  78710;