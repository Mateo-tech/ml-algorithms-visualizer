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
    svg.on("click", (event) => pressEventHandler(event));
    addPointsManuallyButton.addEventListener("click", () => changeMode("point"));
    addPointsRandomlyButton.addEventListener("click", () => addVectorsRandomly(20, 200, "point"));
    // Load preset goes here
    pointsRemoveButton.addEventListener("click", () => removeButtons());
    addCentroidsManuallyButton.addEventListener("click", () => changeMode("centroid"));
    addCentroidsRandomlyButton.addEventListener("click", () => addVectorsRandomly(2, 10, "centroid"));
    //controllsPlayButton.addEventListener("click", (e: Event) => new KMeans(pointsData, centroidsData));
    // Pause button goes here
    controllsStepButton.addEventListener("click", () => {
        kmeans.setPoints(pointsData);
        kmeans.setCentroids(centroidsData);
        kmeans.nextStep();
    });
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
function removeButtons() {
    pointsData = [];
    pointsGroup.selectAll("circle").remove();
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
        .attr("fill", (p) => { return p.color; })
        .style("stroke", "none");
}
export function drawLine(x, y) {
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
export function moveCentroids(updatedCentroids) {
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
function isPoint(vector) {
    return vector.centroid !== undefined;
}
export class KMeans {
    constructor(points, centroids) {
        this.maxIter = 1;
        this.state = 0;
        this.pointIndex = 0;
        this.centroidIndex = 0;
        this.points = points.map(x => { return Object.assign({}, x); });
        this.centroids = centroids.map(x => { return Object.assign({}, x); });
    }
    nextStep() {
        //pushMessage("Checking distances & assigning points to the closest centroid...")
        //pushMessage("Calculating the means and updating centroids...", undefined);
        //pushMessage(undefined, "Point (" + this.points[j].x + ", " + this.points[j].y + ") assigned to centroid (" + closestCentroid.x + ", " + closestCentroid.y + ")");
        if (this.points.length == 0 || this.centroids.length == 0) {
            return;
        }
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
        }
        else if (this.state == 1) {
            this.updateCentroids();
            this.pointIndex = 0;
            this.centroidIndex = 0;
            this.state = 0;
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
let kmeans = new KMeans([], []);
//# sourceMappingURL=app.js.map