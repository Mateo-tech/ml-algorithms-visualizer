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
let controllsSlider = document.getElementById("speed-range-slider");
// Verbose
let mainMessage = document.getElementById("message-window-main-message");
let subMessage = document.getElementById("message-window-sub-message");
let pointsData = [];
let centroidsData = [];
let mode; //"none", "point", "centroid"
let playing = false;
let animationSpeed = controllsSlider.valueAsNumber;
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
    pointsRemoveButton.addEventListener("click", () => removePoints());
    addCentroidsManuallyButton.addEventListener("click", () => changeMode("centroid"));
    addCentroidsRandomlyButton.addEventListener("click", () => addVectorsRandomly(2, 10, "centroid"));
    centroidsRemoveButton.addEventListener("click", () => removeCentroids());
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
    controllsSlider.addEventListener("input", (e) => {
        animationSpeed = e.target.valueAsNumber;
        console.log(animationSpeed);
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
function isPoint(vector) {
    return vector.centroid !== undefined;
}
export class KMeans {
    constructor(points, centroids) {
        this.maxIter = 20;
        this.currentIter = 0;
        this.state = 0;
        this.pointIndex = 0;
        this.centroidIndex = 0;
        this.points = points.map(x => { return Object.assign({}, x); });
        this.centroids = centroids.map(x => { return Object.assign({}, x); });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.points.length == 0 || this.centroids.length == 0) {
                return;
            }
            while (playing && this.currentIter <= this.maxIter) {
                this.step();
                yield new Promise(f => setTimeout(f, 1000 - animationSpeed));
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
        return __awaiter(this, void 0, void 0, function* () {
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
            yield moveCentroids(this.centroids);
        });
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