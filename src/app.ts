import { Point, Centroid, KMeans, Vector, isPoint } from "./algorithms/kmeans.js";
import { convexhull } from "./utils/convexHull.js"
import * as _d3 from "d3";

declare global {
    const d3: typeof _d3;
}

const WIDTH = 900;
const HEIGHT = 550;

// Canvas
const svg = d3.select("svg").attr("width", WIDTH).attr("height", HEIGHT)

const clustersGroup = svg.append("g");
const distancesGroup = svg.append("g");
const pointsGroup = svg.append("g");
const centroidsGroup = svg.append("g");

// Points
let addPointsManuallyButton: HTMLButtonElement = document.getElementById("add-points-manually-btn") as HTMLButtonElement;
let addPointsRandomlyButton: HTMLButtonElement = document.getElementById("add-points-randomly-btn") as HTMLButtonElement;
let addPointsLoadButtton: HTMLButtonElement = document.getElementById("add-points-load-btn") as HTMLButtonElement;
let pointsRemoveButton: HTMLButtonElement = document.getElementById("add-points-remove-btn") as HTMLButtonElement;

// Centroids
let addCentroidsManuallyButton: HTMLButtonElement = document.getElementById("add-centroids-manually-btn") as HTMLButtonElement;
let addCentroidsRandomlyButton: HTMLButtonElement = document.getElementById("add-centroids-randomly-btn") as HTMLButtonElement;
let addCentroidsSmartButtton: HTMLButtonElement = document.getElementById("add-centroids-smart-btn") as HTMLButtonElement;
let centroidsRemoveButton: HTMLButtonElement = document.getElementById("add-centroids-remove-btn") as HTMLButtonElement;

// Controlls
let controllsPlayButton: HTMLButtonElement = document.getElementById("controlls-play-btn") as HTMLButtonElement;
let controllsPauseButton: HTMLButtonElement = document.getElementById("controlls-pause-btn") as HTMLButtonElement;
let controllsStepButton: HTMLButtonElement = document.getElementById("controlls-step-btn") as HTMLButtonElement;
let controllsResetButton: HTMLButtonElement = document.getElementById("controlls-reset-btn") as HTMLButtonElement;
let controllsSlider: HTMLInputElement = document.getElementById("speed-range-slider") as HTMLInputElement;
let controllsDistanceLinesCheckbox: HTMLInputElement = document.getElementById("distance-lines-checkbox") as HTMLInputElement;

// Verbose
let iteration: HTMLHeadElement = document.getElementById("message-window-iteration") as HTMLHeadElement;
let mainMessage: HTMLHeadElement = document.getElementById("message-window-main-message") as HTMLHeadElement;
let subMessage: HTMLHeadElement = document.getElementById("message-window-sub-message") as HTMLHeadElement;

let pointsData: Point[] = [];
let centroidsData: Centroid[] = [];

let pointsCheckpoint: Point[] = [];
let centroidsCheckpoint: Centroid[] = [];

let firstRun = true;

export let showDistanceLines = true;

let mode: string = "point"; //"none", "point", "centroid"

export let playing = false;

export let animationSpeed: number = controllsSlider.valueAsNumber;

let centroidColors: string[] = [
    '#ED0A3F',
    '#0095B7',
    '#33CC99',
    '#cc5454',
    '#0066FF',
    '#EE34D2',
    '#C88A65',
    '#A50B5E',
    '#e9dc64',
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
        removePoints()
    });

    addCentroidsManuallyButton.addEventListener("click", () => changeMode("centroid"));
    addCentroidsRandomlyButton.addEventListener("click", () => addVectorsRandomly(2, 10, "centroid"));
    centroidsRemoveButton.addEventListener("click", () => {
        disableButton(controllsPauseButton);
        enableButton(controllsStepButton);
        enableButton(controllsPlayButton);
        removeCentroids()
    });

    controllsPlayButton.addEventListener("click", () => {
        if (pointsData.length == 0 || centroidColors.length == 0) {
            return;
        }
        if (firstRun) {
            firstRun = false;
            pointsCheckpoint = pointsData.map(x => { return { ...x } });
            centroidsCheckpoint = centroidsData.map(x => { return { ...x } });
            kmeans.setPoints(pointsData);
            kmeans.setCentroids(centroidsData);
        }
        disableButton(controllsPlayButton);
        disableButton(controllsStepButton);
        enableButton(controllsPauseButton);
        enableButton(controllsResetButton);
        playing = true;
        kmeans.run();
    });
    controllsPauseButton.addEventListener("click", () => {
        disableButton(controllsPauseButton);
        enableButton(controllsStepButton);
        enableButton(controllsPlayButton);
        playing = false;
    });
    controllsStepButton.addEventListener("click", () => {
        if (firstRun) {
            firstRun = false;
            pointsCheckpoint = pointsData.map(x => { return { ...x } });
            centroidsCheckpoint = centroidsData.map(x => { return { ...x } });
            kmeans.setPoints(pointsData);
            kmeans.setCentroids(centroidsData);
        }
        kmeans.step();
    });
    controllsSlider.addEventListener("input", (e: Event) => {
        animationSpeed = (<HTMLInputElement>e.target).valueAsNumber;
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
    controllsDistanceLinesCheckbox.addEventListener("change", () => {
        showDistanceLines = !showDistanceLines;
    });
}

// TODO Don't pass the data from kmeans
export function showClusters(points: Point[], centroids: Centroid[]) {
    // TODO Temp solution
    playing = false;

    let polygons = []
    for (let i = 0; i < centroids.length; i++) {
        let cluster: Point[] = points.filter(point => point.centroid === centroids[i]);
        let hull = convexhull.makeHull(cluster);
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

function enableButton(button: HTMLButtonElement) {
    button.classList.remove("disabled", "btn-secondary");
    button.classList.add("btn-info");
}

function disableButton(button: HTMLButtonElement) {
    button.classList.remove("btn-info");
    button.classList.add("disabled", "btn-secondary");
}

function changeMode(newMode: string) {
    mode = newMode;
}

function addVectorsRandomly(min: number, max: number, type: string) {
    let numOfPoints = Math.floor(Math.random() * (max - min + 1) + min);
    for (let i = 0; i < numOfPoints; i++) {
        // Don't fuck it up with the naming, we are going wild here
        let x = Math.floor(Math.random() * document.getElementById("canvas")!.clientWidth);
        let y = Math.floor(Math.random() * document.getElementById("canvas")!.clientHeight);
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

function pressEventHandler(e: MouseEvent) {
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

export function drawVector(vector: Vector) {
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
        })
}

export function changePointColor(point: Point) {
    pointsGroup
        .selectAll("circle[cx='" + point.x + "'][cy='" + point.y + "']")
        .data([point])
        .transition()
        .duration(100)
        .attr("fill", (p) => { return p.color; })
        .style("stroke", "none");
}

export async function drawLine(x: Vector, y: Vector) {
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
}

export function removeLine() {
    distancesGroup.selectAll("line").remove();
}

export async function moveCentroids(updatedCentroids: Centroid[]) {
    let databoundCentroids = centroidsGroup.selectAll("circle").data(updatedCentroids);;
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

function addPoint(x: number, y: number, color = "white", centroid = null) {
    if (pointsData.length >= 1000) {
        return;
    }
    let point = { x: x, y: y, color: color, centroid: centroid };
    pointsData.push(point);
    drawVector(point);
}

function addCentroid(x: number, y: number, color: string) {
    let centroid = { x: x, y: y, color: color }
    if (centroidsData.length >= 10) {
        return;
    } else {
        centroidsData.push(centroid)
        drawVector(centroid);
    }
}

export function pushMessage(iterationNumber?: number, mainMessageText?: string, subMessageText?: string) {
    if (iterationNumber) {
        iteration.innerText = "Iteration " + iterationNumber.toString();
    }
    if (mainMessageText != undefined) {
        mainMessage.innerText = mainMessageText;
    }
    if (subMessageText != undefined) {
        subMessage.innerHTML = subMessageText;
    }
}



let kmeans: KMeans = new KMeans([], []);

