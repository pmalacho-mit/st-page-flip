import { ImagePageCollection } from './Collection/ImagePageCollection';
import { HTMLPageCollection } from './Collection/HTMLPageCollection';
import { Flip } from './Flip/Flip';
import { CanvasRender } from './Render/CanvasRender';
import { HTMLUI } from './UI/HTMLUI';
import { CanvasUI } from './UI/CanvasUI';
import { Helper } from './Helper';
import { EventObject } from './Event/EventObject';
import { HTMLRender } from './Render/HTMLRender';
import { Settings } from './Settings';
import './Style/flipflow.css';
/**
 * Class representing a main flipflow object
 *
 * @extends EventObject
 */
export class flipflow extends EventObject {
    /**
     * Create a new flipflow instance
     *
     * @constructor
     * @param {HTMLElement} inBlock - Root HTML Element
     * @param {Object} setting - Configuration object
     */
    constructor(inBlock, setting) {
        super();
        this.isUserTouch = false;
        this.isUserMove = false;
        this.setting = null;
        this.pages = null;
        this.setting = new Settings().getSettings(setting);
        this.block = inBlock;
    }
    /**
     * Destructor. Remove a root HTML element and all event handlers
     */
    destroy() {
        this.ui.destroy();
        this.block.remove();
    }
    /**
     * Update the render area. Re-show current page.
     */
    update() {
        this.render.update();
        this.pages.show();
    }
    /**
     * Load pages from images on the Canvas mode
     *
     * @param {string[]} imagesHref - List of paths to images
     */
    loadFromImages(imagesHref) {
        this.ui = new CanvasUI(this.block, this, this.setting);
        const canvas = this.ui.getCanvas();
        this.render = new CanvasRender(this, this.setting, canvas);
        this.flipController = new Flip(this.render, this);
        this.pages = new ImagePageCollection(this, this.render, imagesHref);
        this.pages.load();
        this.render.start();
        this.pages.show(this.setting.startPage);
        // safari fix
        setTimeout(() => {
            this.ui.update();
            this.trigger('init', this, {
                page: this.setting.startPage,
                mode: this.render.getOrientation(),
            });
        }, 1);
    }
    /**
     * Load pages from HTML elements on the HTML mode
     *
     * @param {(NodeListOf<HTMLElement>|HTMLElement[])} items - List of pages as HTML Element
     */
    loadFromHTML(items) {
        this.ui = new HTMLUI(this.block, this, this.setting, items);
        this.render = new HTMLRender(this, this.setting, this.ui.getDistElement());
        this.flipController = new Flip(this.render, this);
        this.pages = new HTMLPageCollection(this, this.render, this.ui.getDistElement(), items);
        this.pages.load();
        this.render.start();
        this.pages.show(this.setting.startPage);
        // safari fix
        setTimeout(() => {
            this.ui.update();
            this.trigger('init', this, {
                page: this.setting.startPage,
                mode: this.render.getOrientation(),
            });
        }, 1);
    }
    /**
     * Update current pages from images
     *
     * @param {string[]} imagesHref - List of paths to images
     */
    updateFromImages(imagesHref) {
        const current = this.pages.getCurrentPageIndex();
        this.pages.destroy();
        this.pages = new ImagePageCollection(this, this.render, imagesHref);
        this.pages.load();
        this.pages.show(current);
        this.trigger('update', this, {
            page: current,
            mode: this.render.getOrientation(),
        });
    }
    /**
     * Update current pages from HTML
     *
     * @param {(NodeListOf<HTMLElement>|HTMLElement[])} items - List of pages as HTML Element
     */
    updateFromHtml(items) {
        const current = this.pages.getCurrentPageIndex();
        this.pages.destroy();
        this.pages = new HTMLPageCollection(this, this.render, this.ui.getDistElement(), items);
        this.pages.load();
        this.ui.updateItems(items);
        this.render.reload();
        this.pages.show(current);
        this.trigger('update', this, {
            page: current,
            mode: this.render.getOrientation(),
        });
    }
    /**
     * Clear pages from HTML (remove to initinalState)
     */
    clear() {
        this.pages.destroy();
        this.ui.clear();
    }
    /**
     * Turn to the previous page (without animation)
     */
    turnToPrevPage() {
        this.pages.showPrev();
    }
    /**
     * Turn to the next page (without animation)
     */
    turnToNextPage() {
        this.pages.showNext();
    }
    /**
     * Turn to the specified page number (without animation)
     *
     * @param {number} page - New page number
     */
    turnToPage(page) {
        this.pages.show(page);
    }
    /**
     * Turn to the next page (with animation)
     *
     * @param {FlipCorner} corner - Active page corner when turning
     */
    flipNext(corner = 'top' /* FlipCorner.TOP */) {
        this.flipController.flipNext(corner);
    }
    /**
     * Turn to the prev page (with animation)
     *
     * @param {FlipCorner} corner - Active page corner when turning
     */
    flipPrev(corner = 'top' /* FlipCorner.TOP */) {
        this.flipController.flipPrev(corner);
    }
    /**
     * Turn to the specified page number (with animation)
     *
     * @param {number} page - New page number
     * @param {FlipCorner} corner - Active page corner when turning
     */
    flip(page, corner = 'top' /* FlipCorner.TOP */) {
        this.flipController.flipToPage(page, corner);
    }
    /**
     * Call a state change event trigger
     *
     * @param {FlippingState} newState - New  state of the object
     */
    updateState(newState) {
        this.trigger('changeState', this, newState);
    }
    /**
     * Call a page number change event trigger
     *
     * @param {number} newPage - New page Number
     */
    updatePageIndex(newPage) {
        this.trigger('flip', this, newPage);
    }
    /**
     * Call a page orientation change event trigger. Update UI and rendering area
     *
     * @param {Orientation} newOrientation - New page orientation (portrait, landscape)
     */
    updateOrientation(newOrientation) {
        this.ui.setOrientationStyle(newOrientation);
        this.update();
        this.trigger('changeOrientation', this, newOrientation);
    }
    /**
     * Call a page direction change event trigger. Update UI and rendering area
     *
     * @param {boolean} newRTL - New page direction
     */
    updateRTL(newRTL) {
        this.ui.setRTLStyle(newRTL);
        this.update();
        this.trigger('changeRTL', this, newRTL);
    }
    /**
     * Get the total number of pages in a book
     *
     * @returns {number}
     */
    getPageCount() {
        return this.pages.getPageCount();
    }
    /**
     * Get the index of the current page in the page list (starts at 0)
     *
     * @returns {number}
     */
    getCurrentPageIndex() {
        return this.pages.getCurrentPageIndex();
    }
    /**
     * Get page from collection by number
     *
     * @param {number} pageIndex
     * @returns {Page}
     */
    getPage(pageIndex) {
        return this.pages.getPage(pageIndex);
    }
    /**
     * Get the current rendering object
     *
     * @returns {Render}
     */
    getRender() {
        return this.render;
    }
    /**
     * Get current object responsible for flipping
     *
     * @returns {Flip}
     */
    getFlipController() {
        return this.flipController;
    }
    /**
     * Get current page orientation
     *
     * @returns {Orientation} Сurrent orientation: portrait or landscape
     */
    getOrientation() {
        return this.render.getOrientation();
    }
    /**
     * Get current book sizes and position
     *
     * @returns {PageRect}
     */
    getBoundsRect() {
        return this.render.getRect();
    }
    /**
     * Get configuration object
     *
     * @returns {FlipSetting}
     */
    getSettings() {
        return this.setting;
    }
    /**
     * Get UI object
     *
     * @returns {UI}
     */
    getUI() {
        return this.ui;
    }
    /**
     * Get current flipping state
     *
     * @returns {FlippingState}
     */
    getState() {
        return this.flipController.getState();
    }
    /**
     * Get page collection
     *
     * @returns {PageCollection}
     */
    getPageCollection() {
        return this.pages;
    }
    /**
     * Start page turning. Called when a user clicks or touches
     *
     * @param {Point} pos - Touch position in coordinates relative to the book
     */
    startUserTouch(pos) {
        this.mousePosition = pos; // Save touch position
        this.isUserTouch = true;
        this.isUserMove = false;
    }
    /**
     * Called when a finger / mouse moves
     *
     * @param {Point} pos - Touch position in coordinates relative to the book
     * @param {boolean} isTouch - True if there was a touch event, not a mouse click
     */
    userMove(pos, isTouch) {
        if (!this.isUserTouch && !isTouch && this.setting.showPageCorners) {
            this.flipController.showCorner(pos); // fold Page Corner
        } else if (this.isUserTouch) {
            if (Helper.GetDistanceBetweenTwoPoint(this.mousePosition, pos) > 5) {
                this.isUserMove = true;
                this.flipController.fold(pos);
            }
        }
    }
    /**
     * Сalled when the user has stopped touching
     *
     * @param {Point} pos - Touch end position in coordinates relative to the book
     * @param {boolean} isSwipe - true if there was a mobile swipe event
     */
    userStop(pos, isSwipe = false) {
        if (this.isUserTouch) {
            this.isUserTouch = false;
            if (!isSwipe) {
                if (!this.isUserMove) this.flipController.flip(pos);
                else this.flipController.stopMove();
            }
        }
    }
}
