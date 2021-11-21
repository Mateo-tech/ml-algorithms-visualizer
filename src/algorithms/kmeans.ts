import { moveCentroids, playing, animationSpeed, removeLine, drawLine, changePointColor, showClusters, showDistanceLines, pushMessage } from "../app.js";

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

export function isPoint(vector: Vector): vector is Point {
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

        while (playing) {
            await this.step();
            if (showDistanceLines) {
                await new Promise(f => setTimeout(f, 1000 - animationSpeed + 1))
            };
        }
    }

    public async step() {
        if (this.points.length == 0 || this.centroids.length == 0) {
            return;
        }

        if (this.currentIter >= this.maxIter) {
            showClusters(this.points, this.centroids);
            return;
        }

        //Drop line if exists
        removeLine();

        // Measuring distances and assigning to centroids
        if (this.state == 0) {
            pushMessage(this.currentIter + 1, "Checking distances & assigning points to the closest centroid...", undefined)
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
            pushMessage(this.currentIter + 1, "Calculating the means and updating centroids...", "");
            this.updateCentroids();
            this.pointIndex = 0;
            this.centroidIndex = 0;
            this.state = 0;
            this.currentIter++;
            
            // TODO Move this
            if (playing) {
                await new Promise(f => setTimeout(f, 300))
            }
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
        if (showDistanceLines) {
            drawLine(point, centroid);
        }
    }

    private assignToCentroid(point: Point) {
        point.color = point.centroid != null ? point.centroid.color : "white";
        pushMessage(this.currentIter + 1, undefined, "Point (" + point.x + ", " + point.y + ") assigned to centroid (" + point.centroid?.x + ", " + point.centroid?.y + ")" + "    ▇".fontcolor(point.color));
        changePointColor(point);
    }

    private async updateCentroids() {
        for (let i = 0; i < this.centroids.length; i++) {
            let clusteteredPoints: Point[] = this.points.filter(point => point.centroid === this.centroids[i]);
            let sumX: number = 0;
            let sumY: number = 0;
            for (let j = 0; j < clusteteredPoints.length; j++) {
                sumX += clusteteredPoints[j].x;
                sumY += clusteteredPoints[j].y;
            }
            let newX: number = Math.floor(sumX / clusteteredPoints.length);
            let newY: number = Math.floor(sumY / clusteteredPoints.length);
            this.centroids[i].x = newX;
            this.centroids[i].y = newY;
        }
         moveCentroids(this.centroids);
    }

    private calculateDistance(a: Vector, b: Vector) {
        return Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2))
    }

    public setPoints(points: Point[]) {
        this.points = points.map(x => { return { ...x } });
    }

    public setCentroids(centroids: Centroid[]) {
        this.centroids = centroids.map(x => { return { ...x } });
    }

    public removePoints() {
        this.points = [];
    }

    public removeCentroids() {
        this.centroids = [];
    }
}