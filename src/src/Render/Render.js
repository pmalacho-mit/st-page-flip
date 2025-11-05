/**
 * Class responsible for rendering the book
 */
export class Render {
    constructor(app, setting) {
        /** Left static book page */
        this.leftPage = null;
        /** Right static book page */
        this.rightPage = null;
        /** Page currently flipping */
        this.flippingPage = null;
        /** Next page at the time of flipping */
        this.bottomPage = null;
        /** Current flipping direction */
        this.direction = null;
        /** Current book orientation */
        this.orientation = null;
        this.rtl = null;
        /** Сurrent state of the shadows */
        this.shadow = null;
        /** Сurrent animation process */
        this.animation = null;
        /** Page borders while flipping */
        this.pageRect = null;
        /** Current book area */
        this.boundsRect = null;
        /** Timer started from start of rendering */
        this.timer = 0;
        /**
         * Safari browser definitions for resolving a bug with a css property clip-area
         *
         * https://bugs.webkit.org/show_bug.cgi?id=126207
         */
        this.safari = false;
        this.setting = setting;
        this.app = app;
        // detect safari
        const regex = new RegExp('Version\\/[\\d\\.]+.*Safari/');
        this.safari = regex.exec(window.navigator.userAgent) !== null;
    }
    /**
     * Executed when requestAnimationFrame is called. Performs the current animation process and call drawFrame()
     *
     * @param timer
     */
    render(timer) {
        if (this.animation !== null) {
            // Find current frame of animation
            const frameIndex = Math.round((timer - this.animation.startedAt) / this.animation.durationFrame);
            if (frameIndex < this.animation.frames.length) {
                this.animation.frames[frameIndex]();
            }
            else {
                this.animation.onAnimateEnd();
                this.animation = null;
            }
        }
        this.timer = timer;
        this.drawFrame();
    }
    /**
     * Running requestAnimationFrame, and rendering process
     */
    start() {
        this.update();
        const loop = (timer) => {
            this.render(timer);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
    /**
     * Start a new animation process
     *
     * @param {FrameAction[]} frames - Frame list
     * @param {number} duration - total animation duration
     * @param {AnimationSuccessAction} onAnimateEnd - Animation callback function
     */
    startAnimation(frames, duration, onAnimateEnd) {
        this.finishAnimation(); // finish the previous animation process
        this.animation = {
            frames,
            duration,
            durationFrame: duration / frames.length,
            onAnimateEnd,
            startedAt: this.timer,
        };
    }
    /**
     * End the current animation process and call the callback
     */
    finishAnimation() {
        if (this.animation !== null) {
            this.animation.frames[this.animation.frames.length - 1]();
            if (this.animation.onAnimateEnd !== null) {
                this.animation.onAnimateEnd();
            }
        }
        this.animation = null;
    }
    /**
     * Recalculate the size of the displayed area, and update the page orientation
     */
    update() {
        this.boundsRect = null;
        const orientation = this.calculateBoundsRect();
        const rtl = this.app.getSettings().rtl;
        if (this.orientation !== orientation) {
            this.orientation = orientation;
            this.app.updateOrientation(orientation);
        }
        if (this.rtl !== rtl) {
            this.rtl = rtl;
            this.app.updateRTL(rtl);
        }
    }
    /**
     * Calculate the size and position of the book depending on the parent element and configuration parameters
     */
    calculateBoundsRect() {
        let orientation = "landscape" /* Orientation.LANDSCAPE */;
        const blockWidth = this.getBlockWidth();
        const middlePoint = {
            x: blockWidth / 2,
            y: this.getBlockHeight() / 2,
        };
        const ratio = this.setting.width / this.setting.height;
        let pageWidth = this.setting.width;
        let pageHeight = this.setting.height;
        let left = middlePoint.x - pageWidth;
        if (this.setting.size === "stretch" /* SizeType.STRETCH */) {
            if (blockWidth < this.setting.minWidth * 2 && this.app.getSettings().usePortrait)
                orientation = "portrait" /* Orientation.PORTRAIT */;
            pageWidth =
                orientation === "portrait" /* Orientation.PORTRAIT */
                    ? this.getBlockWidth()
                    : this.getBlockWidth() / 2;
            if (pageWidth > this.setting.maxWidth)
                pageWidth = this.setting.maxWidth;
            pageHeight = pageWidth / ratio;
            if (pageHeight > this.getBlockHeight()) {
                pageHeight = this.getBlockHeight();
                pageWidth = pageHeight * ratio;
            }
            left =
                orientation === "portrait" /* Orientation.PORTRAIT */
                    ? middlePoint.x - pageWidth / 2 - pageWidth
                    : middlePoint.x - pageWidth;
        }
        else {
            if (blockWidth < pageWidth * 2) {
                if (this.app.getSettings().usePortrait) {
                    orientation = "portrait" /* Orientation.PORTRAIT */;
                    left = middlePoint.x - pageWidth / 2 - pageWidth;
                }
            }
        }
        this.boundsRect = {
            left,
            top: middlePoint.y - pageHeight / 2,
            width: pageWidth * 2,
            height: pageHeight,
            pageWidth: pageWidth,
        };
        return orientation;
    }
    /**
     * Set the current parameters of the drop shadow
     *
     * @param {Point} pos - Shadow Position Start Point
     * @param {number} angle - The angle of the shadows relative to the book
     * @param {number} progress - Flipping progress in percent (0 - 100)
     * @param {FlipDirection} direction - Flipping Direction, the direction of the shadow gradients
     */
    setShadowData(pos, angle, progress, direction) {
        if (!this.app.getSettings().drawShadow)
            return;
        const maxShadowOpacity = 100 * this.getSettings().maxShadowOpacity;
        this.shadow = {
            pos,
            angle,
            width: (((this.getRect().pageWidth * 3) / 4) * progress) / 100,
            opacity: ((100 - progress) * maxShadowOpacity) / 100 / 100,
            direction,
            progress: progress * 2,
        };
    }
    /**
     * Clear shadow
     */
    clearShadow() {
        this.shadow = null;
    }
    /**
     * Get parent block offset width
     */
    getBlockWidth() {
        return this.app.getUI().getDistElement().offsetWidth;
    }
    /**
     * Get parent block offset height
     */
    getBlockHeight() {
        return this.app.getUI().getDistElement().offsetHeight;
    }
    /**
     * Get current flipping direction
     */
    getDirection() {
        return this.direction;
    }
    /**
     * Сurrent size and position of the book
     */
    getRect() {
        if (this.boundsRect === null)
            this.calculateBoundsRect();
        return this.boundsRect;
    }
    /**
     * Get configuration object
     */
    getSettings() {
        return this.app.getSettings();
    }
    /**
     * Get current book orientation
     */
    getOrientation() {
        return this.orientation;
    }
    /**
     * Get current book direction
     */
    getRTL() {
        return this.rtl;
    }
    /**
     * Set page area while flipping
     *
     * @param direction
     */
    setPageRect(pageRect) {
        this.pageRect = pageRect;
    }
    /**
     * Set flipping direction
     *
     * @param direction
     */
    setDirection(direction) {
        this.direction = direction;
    }
    /**
     * Set right static book page
     *
     * @param page
     */
    setRightPage(page) {
        if (page !== null)
            page.setOrientation(1 /* PageOrientation.RIGHT */);
        this.rightPage = page;
    }
    /**
     * Set left static book page
     * @param page
     */
    setLeftPage(page) {
        if (page !== null)
            page.setOrientation(0 /* PageOrientation.LEFT */);
        this.leftPage = page;
    }
    /**
     * Set next page at the time of flipping
     * @param page
     */
    setBottomPage(page) {
        if (page !== null)
            page.setOrientation(this.direction === 1 /* FlipDirection.BACK */ ? 0 /* PageOrientation.LEFT */ : 1 /* PageOrientation.RIGHT */);
        this.bottomPage = page;
    }
    /**
     * Set currently flipping page
     *
     * @param page
     */
    setFlippingPage(page) {
        if (page !== null)
            page.setOrientation(this.direction === 0 /* FlipDirection.FORWARD */ &&
                this.orientation !== "portrait" /* Orientation.PORTRAIT */
                ? 0 /* PageOrientation.LEFT */
                : 1 /* PageOrientation.RIGHT */);
        this.flippingPage = page;
    }
    /**
     * Coordinate conversion function. Window coordinates -> to book coordinates
     *
     * @param {Point} pos - Global coordinates relative to the window
     * @returns {Point} Coordinates relative to the book
     */
    convertToBook(pos) {
        const rect = this.getRect();
        return {
            x: pos.x - rect.left,
            y: pos.y - rect.top,
        };
    }
    isSafari() {
        return this.safari;
    }
    /**
     * Coordinate conversion function. Window coordinates -> to current coordinates of the working page
     *
     * @param {Point} pos - Global coordinates relative to the window
     * @param {FlipDirection} direction  - Current flipping direction
     *
     * @returns {Point} Coordinates relative to the work page
     */
    convertToPage(pos, direction) {
        if (!direction)
            direction = this.direction;
        const rect = this.getRect();
        const x = direction === 0 /* FlipDirection.FORWARD */
            ? pos.x - rect.left - rect.width / 2
            : rect.width / 2 - pos.x + rect.left;
        return {
            x,
            y: pos.y - rect.top,
        };
    }
    /**
     * Coordinate conversion function. Coordinates relative to the work page -> Window coordinates
     *
     * @param {Point} pos - Coordinates relative to the work page
     * @param {FlipDirection} direction  - Current flipping direction
     *
     * @returns {Point} Global coordinates relative to the window
     */
    convertToGlobal(pos, direction) {
        if (!direction)
            direction = this.direction;
        if (pos == null)
            return null;
        const rect = this.getRect();
        const x = direction === 0 /* FlipDirection.FORWARD */
            ? pos.x + rect.left + rect.width / 2
            : rect.width / 2 - pos.x + rect.left;
        return {
            x,
            y: pos.y + rect.top,
        };
    }
    /**
     * Casting the coordinates of the corners of the rectangle in the coordinates relative to the window
     *
     * @param {RectPoints} rect - Coordinates of the corners of the rectangle relative to the work page
     * @param {FlipDirection} direction  - Current flipping direction
     *
     * @returns {RectPoints} Coordinates of the corners of the rectangle relative to the window
     */
    convertRectToGlobal(rect, direction) {
        if (!direction)
            direction = this.direction;
        return {
            topLeft: this.convertToGlobal(rect.topLeft, direction),
            topRight: this.convertToGlobal(rect.topRight, direction),
            bottomLeft: this.convertToGlobal(rect.bottomLeft, direction),
            bottomRight: this.convertToGlobal(rect.bottomRight, direction),
        };
    }
}
