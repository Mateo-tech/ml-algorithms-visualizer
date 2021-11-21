var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { KMeans, isPoint } from "./algorithms/kmeans.js";
import { convexhull } from "./utils/convexHull.js";
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
let addPointsLoadButtton = document.getElementById("add-points-load-btn");
let pointsRemoveButton = document.getElementById("add-points-remove-btn");
// Centroids
let addCentroidsManuallyButton = document.getElementById("add-centroids-manually-btn");
let addCentroidsRandomlyButton = document.getElementById("add-centroids-randomly-btn");
let addCentroidsSmartButtton = document.getElementById("add-centroids-smart-btn");
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
let pointsCheckpoint = [];
let centroidsCheckpoint = [];
let firstRun = true;
let mode; //"none", "point", "centroid"
export let playing = false;
export let animationSpeed = controllsSlider.valueAsNumber;
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
        if (firstRun) {
            firstRun = false;
            pointsCheckpoint = pointsData.map(x => { return Object.assign({}, x); });
            centroidsCheckpoint = centroidsData.map(x => { return Object.assign({}, x); });
        }
        disableButton(controllsPlayButton);
        disableButton(controllsStepButton);
        enableButton(controllsPauseButton);
        playing = true;
        kmeans.setPoints(pointsData);
        kmeans.setCentroids(centroidsData);
        kmeans.run();
    });
    controllsPauseButton.addEventListener("click", () => {
        disableButton(controllsPauseButton);
        enableButton(controllsStepButton);
        enableButton(controllsPlayButton);
        playing = false;
    });
    controllsStepButton.addEventListener("click", () => {
        kmeans.setPoints(pointsData);
        kmeans.setCentroids(centroidsData);
        kmeans.step();
    });
    controllsSlider.addEventListener("input", (e) => {
        animationSpeed = e.target.valueAsNumber;
    });
    controllsResetButton.addEventListener("click", () => {
        playing = false;
        disableButton(controllsPauseButton);
        enableButton(controllsStepButton);
        enableButton(controllsPlayButton);
        distancesGroup.selectAll("line").remove();
        clustersGroup.selectAll("polygon").remove();
        for (let i = 0; i < pointsCheckpoint.length; i++) {
            pointsCheckpoint[i].color = "white";
            changePointColor(pointsCheckpoint[i]);
        }
        moveCentroids(centroidsCheckpoint);
        kmeans = new KMeans(pointsCheckpoint, centroidsCheckpoint);
    });
}
export function showClusters() {
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
    clustersGroup.selectAll("polygon").remove();
    kmeans.removePoints();
}
function removeCentroids() {
    centroidsData = [];
    centroidsGroup.selectAll("circle").remove();
    distancesGroup.selectAll("line").remove();
    clustersGroup.selectAll("polygon").remove();
    kmeans.removeCentroids();
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
export function drawVector(vector) {
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
export function changePointColor(point) {
    pointsGroup
        .selectAll("circle[cx='" + point.x + "'][cy='" + point.y + "']")
        .data([point])
        .transition()
        .duration(100)
        .attr("fill", (p) => { return p.color; })
        .style("stroke", "none");
}
export function drawLine(x, y) {
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
export function removeLine() {
    distancesGroup.selectAll("line").remove();
}
export function moveCentroids(updatedCentroids) {
    return __awaiter(this, void 0, void 0, function* () {
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
export function pushMessage(mainMessageText, subMessageText) {
    if (mainMessageText != undefined) {
        mainMessage.innerText = mainMessageText;
    }
    if (subMessageText != undefined) {
        subMessage.innerText = subMessageText;
    }
}
let kmeans = new KMeans([], []);
//# sourceMappingURL=app.js.map