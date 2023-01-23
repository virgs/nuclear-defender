await Promise.all(levelsToSolve
.map(async level => {
console.log(level.title);
const map = new StandardSokobanAnnotationTranslator()
.translate(level.map);
const output = new SokobanMapProcessor(map)
.strip([Tiles.hero, Tiles.box]);

        const solver = new SokobanSolver({
          strippedMap: output.strippedLayeredTileMatrix,
          staticFeatures: output.pointMap,
          cpu: {
            sleepingCycle: 5000,
            sleepForInMs: 25
          },
          distanceCalculator: new ManhattanDistanceCalculator()
        });

        solutionOutput = await solver.solve(output.removedFeatures);
        const data = {
          title: level.title,
          map: level.map.replace(/\n/g, '\n'),
          ...solutionOutput,
          actions: solutionOutput.actions
              ?.map((action: Actions) => mapActionToString(action))
              .join('')
        };
        solutions.push(data);
        console.log(data);

      }));
console.log('saving file');
const file = new Blob([JSON.stringify(solutions)], {type: 'text/plain'});

const a = document.createElement("a"),
url = URL.createObjectURL(file);
a.href = url;
a.download = 'sokoban-levels-solutions.json';
document.body.appendChild(a);
// a.click();
setTimeout(function () {
document.body.removeChild(a);
window.URL.revokeObjectURL(url);
}, 0);



