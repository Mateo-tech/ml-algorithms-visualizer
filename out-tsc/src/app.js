var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const WIDTH = 900;
const HEIGHT = 550;
// Canvas
const svg = d3.select("svg").attr("width", WIDTH).attr("height", HEIGHT);
const distancesGroup = svg.append("g");
const pointsGroup = svg.append("g");
const centroidsGroup = svg.append("g");
// Points
let addPointsManuallyButton = document.getElementById("add-points-manually-btn");
let addPointsRandomlyButton = document.getElementById("add-points-randomly-btn");
let addPointsLoadButtton = document.getElementById("add-points-load-btn");
let pointsRemoveButton = document.getElementById("btn btn-danger float-end");
// Centroids
let addCentroidsManuallyButton = document.getElementById("add-centroids-manually-btn");
let addCentroidsRandomlyButton = document.getElementById("add-centroids-randomly-btn");
let addCentroidsSmartButtton = document.getElementById("add-centroids-smart-btn");
let centroidsRemoveButton = document.getElementById("add-centroids-remove-btn");
// Controlls
let controllsPlayButton = document.getElementById("controlls-play-btn");
let controllsPauseButton = document.getElementById("controlls-pause-btn");
let controllsStepButton = document.getElementById("controlls-step-btn");
let controllsResetButton = document.getElementById("controlls-reset-btnn");
let controllsSliderButton = document.getElementById("speed-range-slider");
// Verbose
let mainMessage = document.getElementById("message-window-main-message");
let subMessage = document.getElementById("message-window-sub-message");
let pointsData = [];
let centroidsData = [];
let mode; //"none", "point", "centroid"
let centroidColors = [
    '#ED0A3F',
    '#0095B7',
    '#33CC99',
    '#00468C',
    '#0066FF',
    '#EE34D2',
    '#C88A65',
    '#A50B5E',
    '#733380',
    '#87421F'
];
createUserEvents();
function createUserEvents() {
    svg.on("click", (event, d) => pressEventHandler(event));
    addPointsManuallyButton.addEventListener("click", (e) => changeMode("point"));
    addCentroidsManuallyButton.addEventListener("click", (e) => changeMode("centroid"));
    //controllsPlayButton.addEventListener("click", (e: Event) => new KMeans(pointsData, centroidsData));
    // Pause button goes here
    controllsStepButton.addEventListener("click", (e) => {
        let kmeans = new KMeans(pointsData, centroidsData);
        kmeans.step();
    });
}
function changeMode(newMode) {
    mode = newMode;
}
function pressEventHandler(e) {
    let x = d3.pointer(e)[0];
    let y = d3.pointer(e)[1];
    switch (mode) {
        case "none": {
            break;
        }
        case "point": {
            addPoint(x, y);
            break;
        }
        case "centroid": {
            addCentroid(x, y, centroidColors[centroidsData.length]);
            break;
        }
    }
}
export function redrawPoint(updatedPoint) {
    pointsGroup
        .selectAll("circle[cx='" + updatedPoint.x + "'][cy='" + updatedPoint.y + "']")
        .data([updatedPoint])
        .attr("fill", (p) => { return p.color; });
}
export function redrawCentroids(updatedCentroids) {
    let databoundCentroids = centroidsGroup.selectAll("circle").data(updatedCentroids);
    ;
    databoundCentroids.enter().append("circle");
    databoundCentroids.exit().remove();
    databoundCentroids
        .transition()
        .duration(300)
        .attr("cx", (c) => {
        return c.x;
    })
        .attr("cy", (c) => {
        return c.y;
    });
}
function addPoint(x, y, color = "white", centroid) {
    pointsData.push({ x: x, y: y, color: color, centroid: centroid });
    pointsGroup
        .selectAll("circle")
        .data(pointsData)
        .enter()
        .append("circle")
        .attr("cx", (p) => {
        return p.x;
    })
        .attr("cy", (p) => {
        return p.y;
    })
        .attr("fill", (p) => {
        return p.color;
    })
        .attr("r", 3);
}
function addCentroid(x, y, color) {
    if (centroidsData.length >= 10) {
        return;
    }
    else {
        centroidsData.push({ x: x, y: y, color: color });
    }
    centroidsGroup
        .selectAll("circle")
        .data(centroidsData)
        .enter()
        .append("circle")
        .attr("cx", (c) => {
        return c.x;
    })
        .attr("cy", (c) => {
        return c.y;
    })
        .attr("fill", "#0a0d11")
        .style("stroke-width", 2)
        .style("stroke", (c) => {
        return c.color;
    })
        .attr("r", 7);
}
export function pushMessage(mainMessageText, subMessageText) {
    if (mainMessageText != undefined) {
        mainMessage.innerText = mainMessageText;
    }
    if (subMessageText != undefined) {
        subMessage.innerText = subMessageText;
    }
}
export class KMeans {
    constructor(points, centroids) {
        this.maxIter = 1;
        this.points = points.map(x => { return Object.assign({}, x); });
        this.centroids = centroids.map(x => { return Object.assign({}, x); });
        console.log("OIII");
        console.log(this.centroids[0] == centroids[0]);
    }
    step() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this.maxIter; i++) {
                pushMessage("Checking distances & assigning points to the closest centroid...");
                for (let j = 0; j < this.points.length; j++) {
                    let minDistance = Infinity;
                    let distance;
                    let closestCentroid = this.centroids[0]; //Can't assign null/undefined
                    for (let k = 0; k < this.centroids.length; k++) {
                        let distanceLine = distancesGroup.selectAll("line").data([this.points[j]]).enter().append("line");
                        distanceLine
                            .attr("x1", (d) => {
                            return d.x;
                        })
                            .attr("y1", (d) => {
                            return d.y;
                        })
                            .attr("x2", () => {
                            return this.centroids[k].x;
                        })
                            .attr("y2", () => {
                            return this.centroids[k].y;
                        })
                            .attr("stroke", "white")
                            .attr("stroke-opacity", 50);
                        //await new Promise(f => setTimeout(f, 10));
                        distanceLine.remove();
                        distance = this.calculateDistance(this.points[j], this.centroids[k]);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestCentroid = this.centroids[k];
                        }
                    }
                    this.points[j].centroid = closestCentroid;
                    this.points[j].color = closestCentroid.color;
                    pushMessage(undefined, "Point (" + this.points[j].x + ", " + this.points[j].y + ") assigned to centroid (" + closestCentroid.x + ", " + closestCentroid.y + ")");
                    redrawPoint(this.points[j]);
                }
                pushMessage("Calculating the means and updating centroids...", undefined);
                console.log("//");
                console.log(this.centroids);
                this.updateCentroids();
                console.log(this.centroids);
                redrawCentroids(this.centroids);
            }
        });
    }
    updateCentroids() {
        for (let i = 0; i < this.centroids.length; i++) {
            let clusteteredPoints = this.points.filter(point => point.centroid === this.centroids[i]);
            let sumX = 0;
            let sumY = 0;
            for (let j = 0; j < clusteteredPoints.length; j++) {
                sumX += clusteteredPoints[j].x;
                sumY += clusteteredPoints[j].y;
            }
            let newX = sumX / clusteteredPoints.length;
            let newY = sumY / clusteteredPoints.length;
            this.centroids[i].x = newX;
            this.centroids[i].y = newY;
        }
    }
    calculateDistance(a, b) {
        return Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2));
    }
}
//# sourceMappingURL=app.js.map