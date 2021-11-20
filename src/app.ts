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

let kmeans: KMeans;

createUserEvents();

function createUserEvents() {
    svg.on("click", (event, d) => pressEventHandler(event));
    addPointsManuallyButton.addEventListener("click", (e: Event) => changeMode("point"));
    addCentroidsManuallyButton.addEventListener("click", (e: Event) => changeMode("centroid"));
    //controllsPlayButton.addEventListener("click", (e: Event) => new KMeans(pointsData, centroidsData));
    // Pause button goes here
    controllsStepButton.addEventListener("click", (e: Event) => {
        if (kmeans == undefined) {
            kmeans = new KMeans(pointsData, centroidsData)
        } else {
            kmeans.nextStep();
        } 
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
        .attr("fill", (p) => { return p.color; })
        .style("stroke", "none");
}

export function drawLine(x: Vector, y: Vector) {
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
        .attr("stroke-opacity", 50);
}

export function removeLine() {
    distancesGroup.selectAll("line").remove();
}

export function moveCentroids(updatedCentroids: Centroid[]) {
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
    centroid: Centroid | null;
}

function isPoint(vector: Vector): vector is Point {
    return (vector as Point).centroid !== undefined;
}

export class KMeans {
    private points: Point[];
    private centroids: Centroid[];

    private maxIter: number = 1;
    private state: number = 0;
    
    private pointIndex = 0;
    private centroidIndex = 0;

    constructor(points: Point[], centroids: Centroid[]) {
        this.points = points.map(x => { return { ...x } });
        this.centroids = centroids.map(x => { return { ...x } });
    }

    public nextStep() {
        //pushMessage("Checking distances & assigning points to the closest centroid...")
        //pushMessage("Calculating the means and updating centroids...", undefined);
        //pushMessage(undefined, "Point (" + this.points[j].x + ", " + this.points[j].y + ") assigned to centroid (" + closestCentroid.x + ", " + closestCentroid.y + ")");

        //TODO Check for max iter

        console.log("State: " + this.state + ", Point index: " + this.pointIndex + ", Centroid index: " + this.centroidIndex);

        //Drop line if exists
        removeLine();

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
        } else if (this.state == 1) {
            this.updateCentroids();
            this.pointIndex = 0;
            this.centroidIndex = 0;
            this.state = 0;
        }
        return;
    }

    private checkDistance(point: Point, centroid: Centroid) {
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

    private assignToCentroid(point: Point) {
        point.color = point.centroid != null ? point.centroid.color : "white"; 
        changePointColor(point);
    }

    private updateCentroids() {
        for (let i = 0; i < this.centroids.length; i++) {
            let clusteteredPoints: Point[] = this.points.filter(point => point.centroid === this.centroids[i]);
            let sumX: number = 0;
            let sumY: number = 0;
            for (let j = 0; j < clusteteredPoints.length; j++) {
                sumX += clusteteredPoints[j].x;
                sumY += clusteteredPoints[j].y;
            }
            let newX: number = sumX / clusteteredPoints.length;
            let newY: number = sumY / clusteteredPoints.length;
            this.centroids[i].x = newX;
            this.centroids[i].y = newY;
        }
        moveCentroids(this.centroids);
    }

    private calculateDistance(a: Vector, b: Vector) {
        return Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2))
    }
}