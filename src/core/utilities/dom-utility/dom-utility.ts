export class DomUtility {
    public static isClickOutside(event: Event, container: HTMLElement): boolean {
        const path = event.composedPath();
        const target = event.target as HTMLElement;

        return path && !path.includes(container) && !container.contains(target);
    }
}
