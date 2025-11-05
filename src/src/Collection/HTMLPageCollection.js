import { HTMLPage } from '../Page/HTMLPage';
import { PageCollection } from './PageCollection';
/**
 * Сlass representing a collection of pages as HTML Element
 */
export class HTMLPageCollection extends PageCollection {
    constructor(app, render, element, items) {
        super(app, render);
        this.element = element;
        this.pagesElement = items;
    }
    load() {
        for (const pageElement of this.pagesElement) {
            const page = new HTMLPage(this.render, pageElement, pageElement.dataset['density'] === 'hard' ? "hard" /* PageDensity.HARD */ : "soft" /* PageDensity.SOFT */);
            page.load();
            this.pages.push(page);
        }
        this.createSpread();
    }
}
