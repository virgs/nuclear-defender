//TODO add thumbnail?
//TODO show tem as a carrousel instead of a dropdown

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
        title: 'Welcome', //boxesline = 4
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
        title: 'Devotron', //boxesLine = 14
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
        title: 'Snikers', //boxesLine = 15
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
        title: 'Ahituna', //boxesLine = 11
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
        title: 'Small world', //euclidian: {Steps: 126. Total time: 242789; iterations: 231330}, manhattan: actions: Steps(130), iterations: 221890, totalTime: 242230
    },      //                                          Total time: 272507; iterations: 233424, boxesLine = 15
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
        title: 'Memories', //euclidian: {Steps: 66. Total time: 228998; iterations: 216575}, manhattan: {Steps: 66. Total time: 227213; iterations: 216575}, boxesLine = 19
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
        title: 'Oldschool' //{boxesLine: 15, actions: Array(48), iterations: 22200, totalTime: 864}
    },
    {
        map: `
####    ####
#   #  #   #
# *  ## $* #
# $.  .$.  #
 # $.$#.  #
  #.# @$ #
  # $  #.#
 #  .#$.$ #
#  .$.  .$ #
# *$ ##  * #
#   #  #   #
####    ####
`,
        title: 'openbar' //{boxesLine: 15, actions: Array(48), iterations: 22200, totalTime: 864}
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
        title: 'medfest'
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
        title: 'batata'
    },
    {
        map: `
############
#          ##   ####
# ######## ######  #
# ##     #         #
# ## ###   ######$ #
# ## # ## $   $   ##
# ## # ##  ##### ##
# ## ####   $ $  #
# ## ### $ ## @ ##
# # $ ##  #######
# $   ...**.#
########....#
       ######
`,
        title: 'vodka' //{boxesLine: 15, actions: Array(48), iterations: 22200, totalTime: 864}
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
        title: 'isnt it chaotic' //{boxesLine: 15, actions: Array(48), iterations: 22200, totalTime: 864}
    },{
        map: `
   ####
####  #
# $.*.#
# ## .#
#    .####
### $$   #
  #$     #
  #@###  #
  ### ####
`,
        title: 'snoopy' //{boxesLine: 15, actions: Array(48), iterations: 22200, totalTime: 864}
    },{
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
        title: 'bee hive'
    },{
        map: `
  #######
  #  .*@#
###  $$ #
#  $ # ####
#    # $ .#
####..  ###
   ######
`,
        title: 'wooden icecream'
    },{
        map: `
###########
#.. @#    #
##  $$  $ #
###  $$ # #
#...  #   #
###########
`,
        title: 'eminems suitcase'
    },{
        map: `
    #####
#####@  #
#   $$$ #
#..**. ##
#      #
########
`,
        title: 'groundbreak'
    },{
        map: `
 #######
 # .   ##
 #  $   #
####$ *.#
#@$ .   #
#########
`,
        title: 'daredevil'
    },{
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
    },{
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
        title: 'fantasma'
    },{
        map: `
 ######
 #.   ##
#### $.#
#@$  #.#
# $$   #
#. #   #
########
`,
        title: 'pacman enemy'
    },{
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
    },{
        map: `
#####  ###
#   ####.#
# $ #  #.#
#  $#$  .#
#     $@.#
#####  ###
    ####
`,
        title: 'vida loka'
    },{
        map: `
  #####
  #   #
### # ##
#  ... #
# $$ $ #
# @#####
####
`,
        title: 'rocker science'
    },{
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
    },{
        map: `
##### ####
#   ###  #
#     $@ #
## $#$   #
#...#   ##
#########
`,
        title: 'coke tail'
    }];