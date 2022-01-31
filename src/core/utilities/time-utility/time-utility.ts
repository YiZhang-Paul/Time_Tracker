const months = [
    'January', 'February', 'March',
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
];

const oneSecond = 1000;
const oneMinute = oneSecond * 60;
const oneHour = oneMinute * 60;
const defaultLocale = 'en-US';

export class TimeUtility {
    public static isLeapYear(year: number): boolean {
        return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
    }

    public static getDateTimeString(date: Date, locale = defaultLocale): string {
        return `${this.getTimeString(date)}, ${date.toLocaleDateString(locale)}`;
    }

    public static getDateString(date: Date, locale = defaultLocale): string {
        const dayOfWeek = date.toLocaleDateString(locale, { weekday: 'long' });
        const month = this.getShortMonthString(date);
        const suffix = this.getDateSuffix(date.getDate());

        return `${dayOfWeek}, ${month} ${date.getDate()}${suffix}, ${date.getFullYear()}`;
    }

    public static getTimeString(date: Date): string {
        const hours = date.getHours();
        const hoursText = this.prependZero(hours > 12 ? hours % 12 : hours);
        const minutesText = this.prependZero(date.getMinutes());

        return `${hoursText}:${minutesText} ${hours < 12 ? 'AM' : 'PM'}`;
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
