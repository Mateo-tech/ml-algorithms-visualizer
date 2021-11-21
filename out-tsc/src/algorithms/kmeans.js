var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { moveCentroids, playing, animationSpeed, removeLine, drawLine, changePointColor, showClusters } from "../app.js";
export function isPoint(vector) {
    return vector.centroid !== undefined;
}
export class KMeans {
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
        if (this.currentIter >= this.maxIter) {
            showClusters();
            return;
        }
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
//# sourceMappingURL=kmeans.js.map