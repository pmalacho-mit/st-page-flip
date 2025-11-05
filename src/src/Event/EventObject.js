/**
 * A class implementing a basic event model
 */
export class EventObject {
    constructor() {
        this.events = new Map();
    }
    /**
     * Add new event handler
     *
     * @param {string} eventName
     * @param {EventCallback} callback
     */
    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, [callback]);
        }
        else {
            this.events.get(eventName).push(callback);
        }
        return this;
    }
    /**
     * Removing all handlers from an event
     *
     * @param {string} event - Event name
     */
    off(event) {
        this.events.delete(event);
    }
    trigger(eventName, app, data = null) {
        if (!this.events.has(eventName))
            return;
        for (const callback of this.events.get(eventName)) {
            callback({ data, object: app });
        }
    }
}
