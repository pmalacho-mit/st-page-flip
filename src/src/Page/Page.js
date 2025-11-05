/**
 * Class representing a book page
 */
export class Page {
    constructor(render, density) {
        this.state = {
            angle: 0,
            area: [],
            position: { x: 0, y: 0 },
            hardAngle: 0,
            hardDrawingAngle: 0,
        };
        this.createdDensity = density;
        this.nowDrawingDensity = this.createdDensity;
        this.render = render;
    }
    /**
     * Set a constant page density
     *
     * @param {PageDensity} density
     */
    setDensity(density) {
        this.createdDensity = density;
        this.nowDrawingDensity = density;
    }
    /**
     * Set temp page density to next render
     *
     * @param {PageDensity}  density
     */
    setDrawingDensity(density) {
        this.nowDrawingDensity = density;
    }
    /**
     * Set page position
     *
     * @param {Point} pagePos
     */
    setPosition(pagePos) {
        this.state.position = pagePos;
    }
    /**
     * Set page angle
     *
     * @param {number} angle
     */
    setAngle(angle) {
        this.state.angle = angle;
    }
    /**
     * Set page crop area
     *
     * @param {Point[]} area
     */
    setArea(area) {
        this.state.area = area;
    }
    /**
     * Rotate angle for hard pages to next render
     *
     * @param {number} angle
     */
    setHardDrawingAngle(angle) {
        this.state.hardDrawingAngle = angle;
    }
    /**
     * Rotate angle for hard pages
     *
     * @param {number} angle
     */
    setHardAngle(angle) {
        this.state.hardAngle = angle;
        this.state.hardDrawingAngle = angle;
    }
    /**
     * Set page orientation
     *
     * @param {PageOrientation} orientation
     */
    setOrientation(orientation) {
        this.orientation = orientation;
    }
    /**
     * Get temp page density
     */
    getDrawingDensity() {
        return this.nowDrawingDensity;
    }
    /**
     * Get a constant page density
     */
    getDensity() {
        return this.createdDensity;
    }
    /**
     * Get rotate angle for hard pages
     */
    getHardAngle() {
        return this.state.hardAngle;
    }
}
