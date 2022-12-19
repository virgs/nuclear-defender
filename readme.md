# sokoban-ai

## Loading your own map
1. Generate it using the [sokoban standard annotation](https://sokoban.dk) or just copy it from somewhere:
    - [sokoban.dk](https://sokoban.dk/wp-content/uploads/2019/02/DrFogh-It-Is-All-Greek-Publish.txt)
    - [www.sourcecode.se](https://www.sourcecode.se/sokoban/levels)
2. Url encode it using a tool like [this one](https://www.urlencoder.org/)
3. Get the encoded result and use it as url query param (without the <>): `?map=<encoded-data>`
4. Have fun. Challenge your buddies

## Testing an answer
1. Using the following annotation:
   - u => up
   - d => down
   - l -> left
   - r -> right
   - s -> stand (do nothing)
2. Generate a list of moves or copy/paste it from someone else. Like this: `l,u,l,l,u,r,s,d,r,d,d`... and so on 
3. Use it as url query param (without the <>): `?moves=l,u,d,d,r,l,`
4. Have fun.


## If you want to combine both answer and map
1. Use them like this: `?map=<encoded-data>&moves=l,u,d,d,r,l`