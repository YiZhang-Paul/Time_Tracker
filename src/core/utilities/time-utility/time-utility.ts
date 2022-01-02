const months = [
    'January', 'February', 'March',
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
];

const oneSecond = 1000;
const oneMinute = oneSecond * 60;
const oneHour = oneMinute * 60;

export class TimeUtility {
    public static getDateTimeString(date: Date, locale = 'en-US'): string {
        return `${this.getTimeString(date)}, ${date.toLocaleDateString(locale)}`;
    }

    public static getTimeString(date: Date): string {
        const hours = date.getHours();
        const minutes = this.prependZero(date.getMinutes());

        return `${hours > 12 ? hours % 12 : hours}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`;
    }

    public static getShortMonthString(date: Date): string {
        return months[date.getMonth()].slice(0, 3);
    }

    public static getDurationString(milliseconds: number): string {
        const hours = Math.floor(milliseconds / oneHour);
        const minutes = Math.floor(milliseconds % oneHour / oneMinute);
        const seconds = Math.floor(milliseconds % oneMinute / oneSecond);

        return `${this.prependZero(hours)}:${this.prependZero(minutes)}:${this.prependZero(seconds)}`;
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

    private static prependZero(value: number): string {
        return `${value < 10 ? '0' : ''}${value}`;
    }
}
