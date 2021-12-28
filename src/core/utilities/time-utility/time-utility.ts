const months = [
    'January', 'February', 'March',
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
];

export class TimeUtility {
    public static getTimeString(date: Date): string {
        const hours = date.getHours();
        const minutes = this.addLeadingZero(date.getMinutes());

        return `${this.addLeadingZero(hours)}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`;
    }

    public static getDateString(date: Date): string {
        const month = months[date.getMonth()].slice(0, 3);
        const day = date.getDate();
        const suffix = this.getDateSuffix(day);

        return `${month} ${day}${suffix}, ${date.getFullYear()}`;
    }

    private static getDateSuffix(day: number): string {
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

    private static addLeadingZero(value: number): string {
        return `${value < 10 ? '0' : ''}${value}`;
    }
}
