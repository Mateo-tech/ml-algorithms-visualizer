(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.d3 = global.d3 || {}, global.d3));
})(this, (function (exports, d3) { 'use strict';

function _interopNamespace(e) {
if (e && e.__esModule) return e;
var n = Object.create(null);
if (e) {
Object.keys(e).forEach(function (k) {
if (k !== 'default') {
var d = Object.getOwnPropertyDescriptor(e, k);
Object.defineProperty(n, k, d.get ? d : {
enumerable: true,
get: function () { return e[k]; }
});
}
});
}
n["default"] = e;
return Object.freeze(n);
}

var d3__namespace = /*#__PURE__*/_interopNamespace(d3);

//import { Point, Centroid, KMeans, Vector } from "./algorithms/kmeans.js";
const WIDTH = 900;
const HEIGHT = 550;
// Canvas
const svg = d3__namespace.select("svg").attr("width", WIDTH).attr("height", HEIGHT);
const distancesGroup = svg.append("g");
const pointsGroup = svg.append("g");
const centroidsGroup = svg.append("g");
// Points
let addPointsManuallyButton = document.getElementById("add-points-manually-btn");
document.getElementById("add-points-randomly-btn");
document.getElementById("add-points-load-btn");
document.getElementById("btn btn-danger float-end");
// Centroids
let addCentroidsManuallyButton = document.getElementById("add-centroids-manually-btn");
document.getElementById("add-centroids-randomly-btn");
document.getElementById("add-centroids-smart-btn");
document.getElementById("add-centroids-remove-btn");
// Controlls
let controllsPlayButton = document.getElementById("controlls-play-btn");
document.getElementById("controlls-pause-btn");
document.getElementById("controlls-step-btn");
document.getElementById("controlls-reset-btnn");
document.getElementById("speed-range-slider");
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
    svg.on("click", function (event, d) {
        console.log(d);
        console.log(d3__namespace.pointer(event, svg.node()));
        pressEventHandler(event);
    });
    addPointsManuallyButton.addEventListener("click", (e) => changeMode("point"));
    addCentroidsManuallyButton.addEventListener("click", (e) => changeMode("centroid"));
    controllsPlayButton.addEventListener("click", (e) => new KMeans(pointsData, centroidsData));
}
function changeMode(newMode) {
    mode = newMode;
}
function pressEventHandler(e) {
    let x = d3__namespace.pointer(e)[0];
    let y = d3__namespace.pointer(e)[1];
    console.log("mode");
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
// export function redraw(updatedPoints: Point[], updatedCentroids: Centroid[]) {
// //     points = []
// //     centroids = []
// //     // Clear the canvas
// //     ctxMain.clearRect(0, 0, canvasMain.width, canvasMain.height);
// //     for (let point of updatedPoints) {
// //         addPoint(point.x, point.y, point.color)
// //     }
// //     for (let centroid of updatedCentroids) {
// //         addCentroid(centroid.x, centroid.y, centroid.color);
// //     }
// //     console.log("Points: ");
// //     console.log(points);
// //     console.log("Centroids");
// //     console.log(centroids);
// // }
function addPoint(x, y, color = "white", centroid) {
    pointsData.push({ x: x, y: y, color: color, centroid: centroid });
    pointsGroup.selectAll("circle").data(pointsData).enter().append("circle");
    let points = pointsGroup.selectAll("circle").data(pointsData);
    // Draw()
    points.exit().remove();
    points
        .attr("cx", (p) => {
        return p.x;
    })
        .attr("cy", (p) => {
        return p.y;
    })
        .attr("fill", (p) => {
        return p.color;
    })
        .attr("r", 5);
}
function addCentroid(x, y, color) {
    if (centroidsData.length >= 10) {
        return;
    }
    else {
        centroidsData.push({ x: x, y: y, color: color });
        centroidsGroup.selectAll("circle").data(centroidsData).enter().append("circle");
        let centroids = centroidsGroup.selectAll("circle").data(centroidsData);
        // Draw()
        centroids.exit().remove();
        centroids
            .attr("cx", (c) => {
            return c.x;
        })
            .attr("cy", (c) => {
            return c.y;
        })
            .attr("fill", (c) => {
            return c.color;
        })
            .attr("r", 7);
    }
}
// export async function drawDistance(a: Vector, b: Vector) {
//     canvasTemp.style.display = "block";
//     ctxTemp.beginPath();
//     ctxTemp.moveTo(a.x, a.y);
//     ctxTemp.lineTo(b.x, b.y);
//     ctxTemp.strokeStyle = "rgba(255, 255, 255, 0.3)";
//     ctxTemp.stroke();
//     ctxTemp.closePath();
//     await delay(500);
//     ctxTemp.clearRect(0, 0, canvasTemp.width, canvasTemp.height);
// }
function pushMessage(mainMessageText, subMessageText) {
    if (mainMessageText != undefined) {
        mainMessage.innerText = mainMessageText;
    }
    if (subMessageText != undefined) {
        subMessage.innerText = subMessageText;
    }
}
class KMeans {
    constructor(points, centroids) {
        this.maxIter = 1;
        this.points = points;
        this.centroids = centroids;
        this.run();
    }
    run() {
        this.step();
    }
    step() {
        for (let i = 0; i < this.maxIter; i++) {
            for (let j = 0; j < this.points.length; j++) {
                let minDistance = Infinity;
                let distance;
                let closestCentroid = this.centroids[0]; //Can't assign null/undefined
                for (let k = 0; k < this.centroids.length; k++) {
                    let distanceLine = distancesGroup.selectAll("distaneLine").data([this.points[j]]);
                    distanceLine.enter().append("distanceLine")
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
                        .attr("stroke", () => {
                        return this.centroids[k].color;
                    });
                    distance = this.calculateDistance(this.points[j], this.centroids[k]);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCentroid = this.centroids[k];
                    }
                }
                this.points[j].centroid = closestCentroid;
                this.points[j].color = closestCentroid.color;
            }
        }
    }
    calculateDistance(a, b) {
        return Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2));
    }
    draw() {
    }
}

exports.KMeans = KMeans;
exports.pushMessage = pushMessage;

Object.defineProperty(exports, '__esModule', { value: true });

}));
