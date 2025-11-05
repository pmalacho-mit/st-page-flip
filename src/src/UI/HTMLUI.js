import { UI } from './UI';
/**
 * UI for HTML mode
 */
export class HTMLUI extends UI {
    constructor(inBlock, app, setting, items) {
        super(inBlock, app, setting);
        // Second wrapper to HTML page
        this.wrapper.insertAdjacentHTML('afterbegin', '<div class="stf__block"></div>');
        this.distElement = inBlock.querySelector('.stf__block');
        this.items = items;
        for (const item of items) {
            this.distElement.appendChild(item);
        }
        this.setHandlers();
    }
    clear() {
        for (const item of this.items) {
            this.parentElement.appendChild(item);
        }
    }
    /**
     * Update page list from HTMLElements
     *
     * @param {(NodeListOf<HTMLElement>|HTMLElement[])} items - List of pages as HTML Element
     */
    updateItems(items) {
        this.removeHandlers();
        this.distElement.innerHTML = '';
        for (const item of items) {
            this.distElement.appendChild(item);
        }
        this.items = items;
        this.setHandlers();
    }
    update() {
        this.app.getRender().update();
    }
}
