const months = [
    'January', 'February', 'March',
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
];

export class TimeUtility {
    public static getDateTimeString(date: Date, locale = 'en-US'): string {
        return `${this.getTimeString(date)}, ${date.toLocaleDateString(locale)}`;
    }

    public static getTimeString(date: Date): string {
        const hours = date.getHours();
        const minutes = `${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;

        return `${hours > 12 ? hours % 12 : hours}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`;
    }

    public static getShortMonthString(date: Date): string {
        return months[date.getMonth()].slice(0, 3);
    }

    public static getDateSuffix(day: number): string {
        if (day === 1 || day === 21 || day === 31) {
            return 'st';
        }

        if (day === 2 || day === 22) {
            return 'nd';
        }

        if (day === 3 || day === 23) {
            return 'rd';
        }

        return 'th';
    }
}
