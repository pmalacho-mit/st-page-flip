import { Page } from './Page';
import { Helper } from '../Helper';
/**
 * Class representing a book page as a HTML Element
 */
export class HTMLPage extends Page {
    constructor(render, element, density) {
        super(render, density);
        this.copiedElement = null;
        this.temporaryCopy = null;
        this.isLoad = false;
        this.element = element;
        this.element.classList.add('stf__item');
        this.element.classList.add('--' + density);
    }
    newTemporaryCopy() {
        if (this.nowDrawingDensity === "hard" /* PageDensity.HARD */) {
            return this;
        }
        if (this.temporaryCopy === null) {
            this.copiedElement = this.element.cloneNode(true);
            this.element.parentElement.appendChild(this.copiedElement);
            this.temporaryCopy = new HTMLPage(this.render, this.copiedElement, this.nowDrawingDensity);
        }
        return this.getTemporaryCopy();
    }
    getTemporaryCopy() {
        return this.temporaryCopy;
    }
    hideTemporaryCopy() {
        if (this.temporaryCopy !== null) {
            this.copiedElement.remove();
            this.copiedElement = null;
            this.temporaryCopy = null;
        }
    }
    draw(tempDensity) {
        const density = tempDensity ? tempDensity : this.nowDrawingDensity;
        const pagePos = this.render.convertToGlobal(this.state.position);
        const pageWidth = this.render.getRect().pageWidth;
        const pageHeight = this.render.getRect().height;
        this.element.classList.remove('--simple');
        const commonStyle = `
            display: block;
            z-index: ${this.element.style.zIndex};
            left: 0;
            top: 0;
            width: ${pageWidth}px;
            height: ${pageHeight}px;
        `;
        density === "hard" /* PageDensity.HARD */
            ? this.drawHard(commonStyle)
            : this.drawSoft(pagePos, commonStyle);
    }
    drawHard(commonStyle = '') {
        const pos = this.render.getRect().left + this.render.getRect().width / 2;
        const angle = this.state.hardDrawingAngle;
        const newStyle = commonStyle +
            `
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
                clip-path: none;
                -webkit-clip-path: none;
            ` +
            (this.orientation === 0 /* PageOrientation.LEFT */
                ? `transform-origin: ${this.render.getRect().pageWidth}px 0; 
                   transform: translate3d(0, 0, 0) rotateY(${angle}deg);`
                : `transform-origin: 0 0; 
                   transform: translate3d(${pos}px, 0, 0) rotateY(${angle}deg);`);
        this.element.style.cssText = newStyle;
    }
    drawSoft(position, commonStyle = '') {
        let polygon = 'polygon( ';
        for (const p of this.state.area) {
            if (p !== null) {
                let g = this.render.getDirection() === 1 /* FlipDirection.BACK */
                    ? {
                        x: -p.x + this.state.position.x,
                        y: p.y - this.state.position.y,
                    }
                    : {
                        x: p.x - this.state.position.x,
                        y: p.y - this.state.position.y,
                    };
                g = Helper.GetRotatedPoint(g, { x: 0, y: 0 }, this.state.angle);
                polygon += g.x + 'px ' + g.y + 'px, ';
            }
        }
        polygon = polygon.slice(0, -2);
        polygon += ')';
        const newStyle = commonStyle +
            `transform-origin: 0 0; clip-path: ${polygon}; -webkit-clip-path: ${polygon};` +
            (this.render.isSafari() && this.state.angle === 0
                ? `transform: translate(${position.x}px, ${position.y}px);`
                : `transform: translate3d(${position.x}px, ${position.y}px, 0) rotate(${this.state.angle}rad);`);
        this.element.style.cssText = newStyle;
    }
    simpleDraw(orient) {
        const rect = this.render.getRect();
        const pageWidth = rect.pageWidth;
        const pageHeight = rect.height;
        const x = orient === 1 /* PageOrientation.RIGHT */ ? rect.left + rect.pageWidth : rect.left;
        const y = rect.top;
        this.element.classList.add('--simple');
        this.element.style.cssText = `
            position: absolute; 
            display: block; 
            height: ${pageHeight}px; 
            left: ${x}px; 
            top: ${y}px; 
            width: ${pageWidth}px; 
            z-index: ${this.render.getSettings().startZIndex + 1};`;
    }
    getElement() {
        return this.element;
    }
    load() {
        this.isLoad = true;
    }
    setOrientation(orientation) {
        super.setOrientation(orientation);
        this.element.classList.remove('--left', '--right');
        this.element.classList.add(orientation === 1 /* PageOrientation.RIGHT */ ? '--right' : '--left');
    }
    setDrawingDensity(density) {
        this.element.classList.remove('--soft', '--hard');
        this.element.classList.add('--' + density);
        super.setDrawingDensity(density);
    }
}
