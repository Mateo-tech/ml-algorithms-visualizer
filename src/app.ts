//import { Point, Centroid, KMeans, Vector } from "./algorithms/kmeans.js";
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

// Verbose
let mainMessage: HTMLHeadElement = document.getElementById("message-window-main-message") as HTMLButtonElement;
let subMessage: HTMLHeadElement = document.getElementById("message-window-sub-message") as HTMLButtonElement;

let pointsData: Point[] = [];
let centroidsData: Centroid[] = [];

let mode: string; //"none", "point", "centroid"

let playing = false;

let animationSpeed: number = controllsSlider.valueAsNumber;

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
    controllsSlider.addEventListener("input", (e: Event) => {
        animationSpeed = (<HTMLInputElement>e.target).valueAsNumber;
    });
    controllsResetButton.addEventListener("click", (e) => {
        let polygons = []
        for (let i = 0; i < centroidsData.length; i++) {
            let testCluster: Point[] = pointsData.filter(point => point.centroid === centroidsData[i]);
            let hull = convexhull.makeHull(testCluster);
            polygons.push(hull);
        }
        clustersGroup
                .selectAll("polygon")
                .data(polygons)
                .enter()
                .append("polygon")
                .attr("points", function(d) {
                    return d.map(function(d) {
                        return [d.x, d.y].join(", ");
                    }).join(" ");
                })
                .attr("stroke", function(d) {
                    return d.map(function(d) {
                        return d.color;
                    })[0];
                })
                .attr("fill", function(d) {
                    return d.map(function(d) {
                        return d.color;
                    })[0];
                })
                .attr("fill-opacity", "0.05")
                .attr("stroke-width", 1);
    })
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
    kmeans.removePoints();
}

function removeCentroids() {
    centroidsData = [];
    centroidsGroup.selectAll("circle").remove();
    distancesGroup.selectAll("line").remove();
    kmeans.removePoints();
}

function pressEventHandler(e: MouseEvent) {
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
        .duration(500)
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

    private maxIter: number = 5;
    private currentIter: number = 0;
    private state: number = 0;

    private pointIndex = 0;
    private centroidIndex = 0;

    constructor(points: Point[], centroids: Centroid[]) {
        this.points = points.map(x => { return { ...x } });
        this.centroids = centroids.map(x => { return { ...x } });
    }

    public async run() {
        if (this.points.length == 0 || this.centroids.length == 0) {
            return;
        }

        while (playing && this.currentIter <= this.maxIter) {
            this.step();
            await new Promise(f => setTimeout(f, 1000 - animationSpeed))
        }
    }

    public step() {
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
        } else if (this.state == 1) {
            this.updateCentroids();
            this.pointIndex = 0;
            this.centroidIndex = 0;
            this.state = 0;
            this.currentIter++;
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

    public setPoints(points: Point[]) {
        this.points = points;
    }

    public setCentroids(centroids: Centroid[]) {
        this.centroids = centroids;
    }

    public removePoints() {
        this.points = [];
    }

    public removeCentroids() {
        this.centroids = [];
    }
}

let kmeans: KMeans = new KMeans([], []);

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


interface HullPoint {
	x: number;
	y: number;
}


namespace convexhull {
	
	// Returns a new array of points representing the convex hull of
	// the given set of points. The convex hull excludes collinear points.
	// This algorithm runs in O(n log n) time.
	export function makeHull<P extends HullPoint>(points: Array<P>): Array<P> {
		let newPoints: Array<P> = points.slice();
		newPoints.sort(convexhull.POINT_COMPARATOR);
		return convexhull.makeHullPresorted(newPoints);
	}
	
	
	// Returns the convex hull, assuming that each points[i] <= points[i + 1]. Runs in O(n) time.
	export function makeHullPresorted<P extends HullPoint>(points: Array<P>): Array<P> {
		if (points.length <= 1)
			return points.slice();
		
		// Andrew's monotone chain algorithm. Positive y coordinates correspond to "up"
		// as per the mathematical convention, instead of "down" as per the computer
		// graphics convention. This doesn't affect the correctness of the result.
		
		let upperHull: Array<P> = [];
		for (let i = 0; i < points.length; i++) {
			const p: P = points[i];
			while (upperHull.length >= 2) {
				const q: P = upperHull[upperHull.length - 1];
				const r: P = upperHull[upperHull.length - 2];
				if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x))
					upperHull.pop();
				else
					break;
			}
			upperHull.push(p);
		}
		upperHull.pop();
		
		let lowerHull: Array<P> = [];
		for (let i = points.length - 1; i >= 0; i--) {
			const p: P = points[i];
			while (lowerHull.length >= 2) {
				const q: P = lowerHull[lowerHull.length - 1];
				const r: P = lowerHull[lowerHull.length - 2];
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
	
	
	export function POINT_COMPARATOR(a: HullPoint, b: HullPoint): number {
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
	
}