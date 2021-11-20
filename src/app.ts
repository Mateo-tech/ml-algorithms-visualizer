//import { Point, Centroid, KMeans, Vector } from "./algorithms/kmeans.js";
import * as _d3 from "d3";

declare global {
  const d3: typeof _d3;
}

const WIDTH = 900;
const HEIGHT = 550;

// Canvas
const svg = d3.select("svg").attr("width", WIDTH).attr("height", HEIGHT)

const distancesGroup = svg.append("g");
const pointsGroup = svg.append("g");
const centroidsGroup = svg.append("g");

// Points
let addPointsManuallyButton: HTMLButtonElement = document.getElementById("add-points-manually-btn") as HTMLButtonElement;
let addPointsRandomlyButton: HTMLButtonElement = document.getElementById("add-points-randomly-btn") as HTMLButtonElement;
let addPointsLoadButtton: HTMLButtonElement = document.getElementById("add-points-load-btn") as HTMLButtonElement;
let pointsRemoveButton: HTMLButtonElement = document.getElementById("btn btn-danger float-end") as HTMLButtonElement;

// Centroids
let addCentroidsManuallyButton: HTMLButtonElement = document.getElementById("add-centroids-manually-btn") as HTMLButtonElement;
let addCentroidsRandomlyButton: HTMLButtonElement = document.getElementById("add-centroids-randomly-btn") as HTMLButtonElement;
let addCentroidsSmartButtton: HTMLButtonElement = document.getElementById("add-centroids-smart-btn") as HTMLButtonElement;
let centroidsRemoveButton: HTMLButtonElement = document.getElementById("add-centroids-remove-btn") as HTMLButtonElement;

// Controlls
let controllsPlayButton: HTMLButtonElement = document.getElementById("controlls-play-btn") as HTMLButtonElement;
let controllsPauseButton: HTMLButtonElement = document.getElementById("controlls-pause-btn") as HTMLButtonElement;
let controllsStepButton: HTMLButtonElement = document.getElementById("controlls-step-btn") as HTMLButtonElement;
let controllsResetButton: HTMLButtonElement = document.getElementById("controlls-reset-btnn") as HTMLButtonElement;
let controllsSliderButton: HTMLInputElement = document.getElementById("speed-range-slider") as HTMLInputElement;

// Verbose
let mainMessage: HTMLHeadElement = document.getElementById("message-window-main-message") as HTMLButtonElement;
let subMessage: HTMLHeadElement = document.getElementById("message-window-sub-message") as HTMLButtonElement;

let pointsData: Point[] = [];
let centroidsData: Centroid[] = [];

let mode: string; //"none", "point", "centroid"

let centroidColors: string[] = [
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
    addPointsManuallyButton.addEventListener("click", (e: Event) => changeMode("point"));
    addCentroidsManuallyButton.addEventListener("click", (e: Event) => changeMode("centroid"));
    controllsPlayButton.addEventListener("click", (e: Event) => new KMeans(pointsData, centroidsData));
    // Pause button goes here
    controllsStepButton.addEventListener("click", (e: Event) => {
        let kmeans = new KMeans(pointsData, centroidsData)
        kmeans.step();
    });
}


function changeMode(newMode: string) {
    mode = newMode;
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


export function redrawPoint(updatedPoint: Point) {
    pointsGroup
        .selectAll("circle[cx='" + updatedPoint.x + "'][cy='" + updatedPoint.y + "']")
        .data([updatedPoint])
        .attr("fill", (p) => { return p.color; });
}

export function redrawCentroids(updatedCentroids: Centroid[]) {
    centroidsData = []
    for (let centroid of updatedCentroids) {
        addCentroid(centroid.x, centroid.y, centroid.color);
    }

    centroidsGroup
        .selectAll("circle")
        .data(updatedCentroids)
        .enter()
        .transition()
        .duration(500)
        .attr("transform", (c) => {
            return `translate(${c.x}, ${c.y})`
        })
}

function addPoint(x: number, y: number, color = "white", centroid?: Centroid) {
    pointsData.push({ x: x, y: y, color: color, centroid: centroid })

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

function addCentroid(x: number, y: number, color: string) {
    if (centroidsData.length >= 10) {
        return;
    } else {
        centroidsData.push({ x: x, y: y, color: color })
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

export function pushMessage(mainMessageText?: string, subMessageText?: string) {
    if (mainMessageText != undefined) {
        mainMessage.innerText = mainMessageText;
    }
    if (subMessageText != undefined) {
        subMessage.innerText = subMessageText;
    }
}

export type Vector = {
    x: number;
    y: number;
}

export type Centroid = Vector & {
    color: string;
}

export type Point = Vector & {
    color: string;
    centroid: Centroid | undefined;
}

export type Cluster = {
    points: Point[];
    centroid: Centroid;
    color: string;
}

export class KMeans {
    private points: Point[];
    private centroids: Centroid[];

    private maxIter: number = 1;

    constructor(points: Point[], centroids: Centroid[]) {
        this.points = points;
        this.centroids = centroids;
    }


    public async step() {
        for (let i = 0; i < this.maxIter; i++) {

            pushMessage("Checking distances & assigning points to the closest centroid...")
            for (let j = 0; j < this.points.length; j++) {
                let minDistance: number = Infinity;
                let distance: number;
                let closestCentroid: Centroid = this.centroids[0]; //Can't assign null/undefined
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

                    await new Promise(f => setTimeout(f, 10));
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
            console.log("FDGDG");
            console.log("Old centroids:");
            console.log(this.centroids);
            this.updateCentroids();
            console.log("New centroids:");
            console.log(this.centroids);
            //redrawCentroids(this.centroids);
        }
    }

    private updateCentroids() {
        for (let i = 0; i < this.centroids.length; i++) {
            let clusteteredPoints: Point[] = this.points.filter(point => point.centroid === this.centroids[i]);
            console.log("Cluster " + i + ":");
            console.log(clusteteredPoints);
            let sumX: number = 0;
            let sumY: number = 0;
            for (let j = 0; j < clusteteredPoints.length; j++) {
                sumX += clusteteredPoints[j].x;
                sumY += clusteteredPoints[j].y;
            }
            console.log("SumX: " + sumX);
            console.log("SumY: " + sumY);
            let newX: number = sumX / clusteteredPoints.length;
            let newY: number = sumY / clusteteredPoints.length;

            console.log("OldX: " + this.centroids[i].x);
            console.log("OldY: " + this.centroids[i].y);

            console.log("NewX: " + newX);
            console.log("NewY: " + newY);

            this.centroids[i].x = newX;
            this.centroids[i].y = newY;
        }
    }

    private calculateDistance(a: Vector, b: Vector) {
        return Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2))
    }
}