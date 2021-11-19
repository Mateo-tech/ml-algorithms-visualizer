//import { Point, Centroid, KMeans, Vector } from "./algorithms/kmeans.js";
import * as d3 from "d3";

const WIDTH = 900;
const HEIGHT = 550;

// Canvas
const svg = d3.select("#canvas svg").attr("width", WIDTH).attr("height", HEIGHT)

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
    svg.on("click", function(event, d) {
        console.log(d); 
        console.log(d3.pointer(event,svg.node));
        pressEventHandler(event);
    });
    addPointsManuallyButton.addEventListener("click", (e: Event) => changeMode("point"));
    addCentroidsManuallyButton.addEventListener("click", (e: Event) => changeMode("centroid"));
    controllsPlayButton.addEventListener("click", (e: Event) => new KMeans(pointsData, centroidsData));
}


function changeMode(newMode: string) {
    console.log("lol")
    mode = newMode;
}

function pressEventHandler(e: MouseEvent) {
    let x = e.pageX;
    let y = e.pageY;

    console.log("oi");

    switch (mode) {
        case "none": {
            break;
        }
        case "point": {
            addPoint(x, y);
            break;
        }
        case "centroid": {
            // addCentroid(x, y, centroidColors[centroids.length]);
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

function addPoint(x: number, y: number, color = "white", centroid?: Centroid) {
    pointsData.push({ x: x, y: y, color: color, centroid: centroid })

    pointsGroup.selectAll("circle").data(pointsData).enter().append("circle");
    let points = pointsGroup.selectAll("circle").data(pointsData);

    // Draw()
    points.exit().remove();
    points
        .transition()
        .duration(500)
        .attr("px", (p) => {
            return p.x;
          })
        .attr("py", (p) => {
            return p.y;
        })
        .attr("fill", (p) => {
            return p.color;
        })
        .attr("r", 5);
}

// function addCentroid(x: number, y: number, color: string) {
//     if (centroids.length >= 10) {
//         return;
//     } else {
//         centroids.push({ x: x, y: y, color: color})

//         ctxMain.beginPath()
//         ctxMain.arc(x, y, 7, 0, 2 * Math.PI);
//         ctxMain.strokeStyle = "white"
//         ctxMain.fillStyle = color;
//         ctxMain.fill()
//         ctxMain.stroke()
//         ctxMain.closePath()
//     }
// }

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

export function pushMessage(mainMessageText?: string, subMessageText?: string) {
    if (mainMessageText != undefined) {
        mainMessage.innerText = mainMessageText;
    }
    if (subMessageText != undefined) {
        subMessage.innerText = subMessageText;
    }
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
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

    private maxIter:  number = 1;

    constructor(points: Point[], centroids: Centroid[])  {
        this.points = points;
        this.centroids = centroids;
        this.run();
    }

    private run() {
        this.step();
    }

    public step() {
        for (let i = 0; i < this.maxIter; i++) {
            for (let j = 0; j < this.points.length; j++) {
                let minDistance: number = Infinity;
                let distance: number;
                let closestCentroid: Centroid = this.centroids[0]; //Can't assign null/undefined
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

    private calculateDistance(a: Vector, b: Vector) {
        return Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2))
    }

    private draw() {

    }
}