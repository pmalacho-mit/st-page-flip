import { ImagePage } from '../Page/ImagePage';
import { PageCollection } from './PageCollection';
/**
 * Сlass representing a collection of pages as images on the canvas
 */
export class ImagePageCollection extends PageCollection {
    constructor(app, render, imagesHref) {
        super(app, render);
        this.imagesHref = imagesHref;
    }
    load() {
        for (const href of this.imagesHref) {
            const page = new ImagePage(this.render, href, "soft" /* PageDensity.SOFT */);
            page.load();
            this.pages.push(page);
        }
        this.createSpread();
    }
}
