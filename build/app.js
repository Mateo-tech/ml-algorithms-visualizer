(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
typeof define === 'function' && define.amd ? define(['exports'], factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.d3 = global.d3 || {}));
})(this, (function (exports) { 'use strict';

var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function isPoint(vector) {
    return vector.centroid !== undefined;
}
class KMeans {
    constructor(points, centroids) {
        this.maxIter = 5;
        this.currentIter = 0;
        this.state = 0;
        this.pointIndex = 0;
        this.centroidIndex = 0;
        this.points = points.map(x => { return Object.assign({}, x); });
        this.centroids = centroids.map(x => { return Object.assign({}, x); });
    }
    run() {
        return __awaiter$1(this, void 0, void 0, function* () {
            if (this.points.length == 0 || this.centroids.length == 0) {
                return;
            }
            while (exports.playing && this.currentIter <= this.maxIter) {
                this.step();
                yield new Promise(f => setTimeout(f, 1000 - exports.animationSpeed));
            }
        });
    }
    step() {
        //pushMessage("Checking distances & assigning points to the closest centroid...")
        //pushMessage("Calculating the means and updating centroids...", undefined);
        //pushMessage(undefined, "Point (" + this.points[j].x + ", " + this.points[j].y + ") assigned to centroid (" + closestCentroid.x + ", " + closestCentroid.y + ")");
        if (this.points.length == 0 || this.centroids.length == 0) {
            return;
        }
        //console.log("State: " + this.state + ", Point index: " + this.pointIndex + ", Centroid index: " + this.centroidIndex);
        //Drop line if exists
        removeLine();
        // Measuring distances and assigning to centroids
        if (this.state == 0) {
            this.checkDistance(this.points[this.pointIndex], this.centroids[this.centroidIndex]);
            if (this.centroidIndex + 1 == this.centroids.length) {
                this.assignToCentroid(this.points[this.pointIndex]);
                this.pointIndex++;
                this.centroidIndex = -1;
            }
            if (this.pointIndex == this.points.length) {
                this.state = 1;
            }
            this.centroidIndex++;
            // Moving centroids (=> One full iteration)
        }
        else if (this.state == 1) {
            this.updateCentroids();
            this.pointIndex = 0;
            this.centroidIndex = 0;
            this.state = 0;
            this.currentIter++;
        }
        return;
    }
    checkDistance(point, centroid) {
        let distance = this.calculateDistance(point, centroid);
        // At the start, assing to a "random vector" (not changing the color)
        if (point.centroid == null) {
            point.centroid = centroid;
            // Check if the centroid is closer & update the color (don't redraw yet)
        }
        if (distance < this.calculateDistance(point, point.centroid)) {
            point.centroid = centroid;
        }
        drawLine(point, centroid);
    }
    assignToCentroid(point) {
        point.color = point.centroid != null ? point.centroid.color : "white";
        changePointColor(point);
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
        moveCentroids(this.centroids);
    }
    calculateDistance(a, b) {
        return Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2));
    }
    setPoints(points) {
        this.points = points;
    }
    setCentroids(centroids) {
        this.centroids = centroids;
    }
    removePoints() {
        this.points = [];
    }
    removeCentroids() {
        this.centroids = [];
    }
}

/*
 * Convex hull algorithm - Library (TypeScript)
 *
 * Copyright (c) 2020 Project Nayuki
 * https://www.nayuki.io/page/convex-hull-algorithm
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program (see COPYING.txt and COPYING.LESSER.txt).
 * If not, see <http://www.gnu.org/licenses/>.
 */
var convexhull;
(function (convexhull) {
    // Returns a new array of points representing the convex hull of
    // the given set of points. The convex hull excludes collinear points.
    // This algorithm runs in O(n log n) time.
    function makeHull(points) {
        let newPoints = points.slice();
        newPoints.sort(convexhull.POINT_COMPARATOR);
        return convexhull.makeHullPresorted(newPoints);
    }
    convexhull.makeHull = makeHull;
    // Returns the convex hull, assuming that each points[i] <= points[i + 1]. Runs in O(n) time.
    function makeHullPresorted(points) {
        if (points.length <= 1)
            return points.slice();
        // Andrew's monotone chain algorithm. Positive y coordinates correspond to "up"
        // as per the mathematical convention, instead of "down" as per the computer
        // graphics convention. This doesn't affect the correctness of the result.
        let upperHull = [];
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            while (upperHull.length >= 2) {
                const q = upperHull[upperHull.length - 1];
                const r = upperHull[upperHull.length - 2];
                if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x))
                    upperHull.pop();
                else
                    break;
            }
            upperHull.push(p);
        }
        upperHull.pop();
        let lowerHull = [];
        for (let i = points.length - 1; i >= 0; i--) {
            const p = points[i];
            while (lowerHull.length >= 2) {
                const q = lowerHull[lowerHull.length - 1];
                const r = lowerHull[lowerHull.length - 2];
                if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x))
                    lowerHull.pop();
                else
                    break;
            }
            lowerHull.push(p);
        }
        lowerHull.pop();
        if (upperHull.length == 1 && lowerHull.length == 1 && upperHull[0].x == lowerHull[0].x && upperHull[0].y == lowerHull[0].y)
            return upperHull;
        else
            return upperHull.concat(lowerHull);
    }
    convexhull.makeHullPresorted = makeHullPresorted;
    function POINT_COMPARATOR(a, b) {
        if (a.x < b.x)
            return -1;
        else if (a.x > b.x)
            return +1;
        else if (a.y < b.y)
            return -1;
        else if (a.y > b.y)
            return +1;
        else
            return 0;
    }
    convexhull.POINT_COMPARATOR = POINT_COMPARATOR;
})(convexhull || (convexhull = {}));

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
const clustersGroup = svg.append("g");
const distancesGroup = svg.append("g");
const pointsGroup = svg.append("g");
const centroidsGroup = svg.append("g");
// Points
let addPointsManuallyButton = document.getElementById("add-points-manually-btn");
let addPointsRandomlyButton = document.getElementById("add-points-randomly-btn");
document.getElementById("add-points-load-btn");
let pointsRemoveButton = document.getElementById("add-points-remove-btn");
// Centroids
let addCentroidsManuallyButton = document.getElementById("add-centroids-manually-btn");
let addCentroidsRandomlyButton = document.getElementById("add-centroids-randomly-btn");
document.getElementById("add-centroids-smart-btn");
let centroidsRemoveButton = document.getElementById("add-centroids-remove-btn");
// Controlls
let controllsPlayButton = document.getElementById("controlls-play-btn");
let controllsPauseButton = document.getElementById("controlls-pause-btn");
let controllsStepButton = document.getElementById("controlls-step-btn");
let controllsResetButton = document.getElementById("controlls-reset-btn");
let controllsSlider = document.getElementById("speed-range-slider");
// Verbose
let mainMessage = document.getElementById("message-window-main-message");
let subMessage = document.getElementById("message-window-sub-message");
let pointsData = [];
let centroidsData = [];
let mode; //"none", "point", "centroid"
exports.playing = false;
exports.animationSpeed = controllsSlider.valueAsNumber;
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
    svg.on("click", (e) => pressEventHandler(e));
    addPointsManuallyButton.addEventListener("click", () => changeMode("point"));
    addPointsRandomlyButton.addEventListener("click", () => addVectorsRandomly(20, 200, "point"));
    // Load preset goes here
    pointsRemoveButton.addEventListener("click", () => {
        disableButton(controllsPauseButton);
        enableButton(controllsStepButton);
        enableButton(controllsPlayButton);
        removePoints();
    });
    addCentroidsManuallyButton.addEventListener("click", () => changeMode("centroid"));
    addCentroidsRandomlyButton.addEventListener("click", () => addVectorsRandomly(2, 10, "centroid"));
    centroidsRemoveButton.addEventListener("click", () => {
        disableButton(controllsPauseButton);
        enableButton(controllsStepButton);
        enableButton(controllsPlayButton);
        removeCentroids();
    });
    controllsPlayButton.addEventListener("click", () => {
        if (pointsData.length == 0 || centroidColors.length == 0) {
            return;
        }
        disableButton(controllsPlayButton);
        disableButton(controllsStepButton);
        enableButton(controllsPauseButton);
        exports.playing = true;
        kmeans.setPoints(pointsData);
        kmeans.setCentroids(centroidsData);
        kmeans.run();
    });
    controllsPauseButton.addEventListener("click", () => {
        disableButton(controllsPauseButton);
        enableButton(controllsStepButton);
        enableButton(controllsPlayButton);
        exports.playing = false;
    });
    controllsStepButton.addEventListener("click", () => {
        kmeans.setPoints(pointsData);
        kmeans.setCentroids(centroidsData);
        kmeans.step();
    });
    controllsSlider.addEventListener("input", (e) => {
        exports.animationSpeed = e.target.valueAsNumber;
    });
    controllsResetButton.addEventListener("click", (e) => {
        let polygons = [];
        for (let i = 0; i < centroidsData.length; i++) {
            let testCluster = pointsData.filter(point => point.centroid === centroidsData[i]);
            let hull = convexhull.makeHull(testCluster);
            polygons.push(hull);
        }
        clustersGroup
            .selectAll("polygon")
            .data(polygons)
            .enter()
            .append("polygon")
            .attr("points", function (d) {
            return d.map(function (d) {
                return [d.x, d.y].join(", ");
            }).join(" ");
        })
            .attr("stroke", function (d) {
            return d.map(function (d) {
                return d.color;
            })[0];
        })
            .attr("fill", function (d) {
            return d.map(function (d) {
                return d.color;
            })[0];
        })
            .attr("fill-opacity", "0.05")
            .attr("stroke-width", 1);
    });
}
function enableButton(button) {
    button.classList.remove("disabled", "btn-secondary");
    button.classList.add("btn-info");
}
function disableButton(button) {
    button.classList.remove("btn-info");
    button.classList.add("disabled", "btn-secondary");
}
function changeMode(newMode) {
    mode = newMode;
}
function addVectorsRandomly(min, max, type) {
    let numOfPoints = Math.floor(Math.random() * (max - min + 1) + min);
    for (let i = 0; i < numOfPoints; i++) {
        // Don't fuck it up with the naming, we are going wild here
        let x = Math.floor(Math.random() * document.getElementById("canvas").clientWidth);
        let y = Math.floor(Math.random() * document.getElementById("canvas").clientHeight);
        // Very elegant checking :---) TYPE script
        type == "point" ? addPoint(x, y) : addCentroid(x, y, centroidColors[centroidsData.length]);
    }
}
function removePoints() {
    pointsData = [];
    pointsGroup.selectAll("circle").remove();
    distancesGroup.selectAll("line").remove();
    kmeans.removePoints();
}
function removeCentroids() {
    centroidsData = [];
    centroidsGroup.selectAll("circle").remove();
    distancesGroup.selectAll("line").remove();
    kmeans.removePoints();
}
function pressEventHandler(e) {
    let x = d3.pointer(e)[0];
    let y = d3.pointer(e)[1];
    console.log(x + ", " + y);
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
function drawVector(vector) {
    let group = isPoint(vector) ? pointsGroup : centroidsGroup;
    let data = isPoint(vector) ? pointsData : centroidsData;
    let size = isPoint(vector) ? 3 : 7;
    let color = isPoint(vector) ? vector.color : "#0a0d11";
    group
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (v) => {
        return v.x;
    })
        .attr("cy", (v) => {
        return v.y;
    })
        .attr("fill", color)
        .attr("r", size)
        .style("stroke", (v) => {
        return v.color;
    });
}
function changePointColor(point) {
    pointsGroup
        .selectAll("circle[cx='" + point.x + "'][cy='" + point.y + "']")
        .data([point])
        .transition()
        .duration(100)
        .attr("fill", (p) => { return p.color; })
        .style("stroke", "none");
}
function drawLine(x, y) {
    return __awaiter(this, void 0, void 0, function* () {
        let line = distancesGroup.selectAll("line").data([x]).enter().append("line");
        line
            .attr("x1", (d) => {
            return d.x;
        })
            .attr("y1", (d) => {
            return d.y;
        })
            .attr("x2", () => {
            return y.x;
        })
            .attr("y2", () => {
            return y.y;
        })
            .attr("stroke", "white")
            .attr("stroke-width", "1px")
            .attr("opacity", "0.2");
    });
}
function removeLine() {
    distancesGroup.selectAll("line").remove();
}
function moveCentroids(updatedCentroids) {
    return __awaiter(this, void 0, void 0, function* () {
        let databoundCentroids = centroidsGroup.selectAll("circle").data(updatedCentroids);
        databoundCentroids.enter().append("circle");
        databoundCentroids.exit().remove();
        databoundCentroids
            .transition()
            .duration(500)
            .attr("cx", (c) => {
            return c.x;
        })
            .attr("cy", (c) => {
            return c.y;
        });
    });
}
function addPoint(x, y, color = "white", centroid = null) {
    let point = { x: x, y: y, color: color, centroid: centroid };
    pointsData.push(point);
    drawVector(point);
}
function addCentroid(x, y, color) {
    let centroid = { x: x, y: y, color: color };
    if (centroidsData.length >= 10) {
        return;
    }
    else {
        centroidsData.push(centroid);
        drawVector(centroid);
    }
}
function pushMessage(mainMessageText, subMessageText) {
    if (mainMessageText != undefined) {
        mainMessage.innerText = mainMessageText;
    }
    if (subMessageText != undefined) {
        subMessage.innerText = subMessageText;
    }
}
let kmeans = new KMeans([], []);

exports.changePointColor = changePointColor;
exports.drawLine = drawLine;
exports.drawVector = drawVector;
exports.moveCentroids = moveCentroids;
exports.pushMessage = pushMessage;
exports.removeLine = removeLine;

Object.defineProperty(exports, '__esModule', { value: true });

}));
