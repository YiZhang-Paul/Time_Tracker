import { TimeUtility } from './time-utility';

describe('time utility unit test', () => {
    describe('getDateTimeString', () => {
        test('should return correct time', () => {
            expect(TimeUtility.getDateTimeString(new Date(2022, 1, 1, 0, 15))).toEqual('0:15 AM, 2/1/2022');
            expect(TimeUtility.getDateTimeString(new Date(2022, 1, 1, 13, 5))).toEqual('1:05 PM, 2/1/2022');
        });
    });

    describe('getTimeString', () => {
        test('should return correct time', () => {
            expect(TimeUtility.getTimeString(new Date(2022, 1, 1, 0, 15))).toEqual('0:15 AM');
            expect(TimeUtility.getTimeString(new Date(2022, 1, 1, 9, 0))).toEqual('9:00 AM');
            expect(TimeUtility.getTimeString(new Date(2022, 1, 1, 12, 5))).toEqual('12:05 PM');
            expect(TimeUtility.getTimeString(new Date(2022, 1, 1, 13, 5))).toEqual('1:05 PM');
        });
    });

    describe('getShortMonthString', () => {
        test('should return correct month', () => {
            expect(TimeUtility.getShortMonthString(new Date(2022, 0))).toEqual('Jan');
            expect(TimeUtility.getShortMonthString(new Date(2022, 1))).toEqual('Feb');
            expect(TimeUtility.getShortMonthString(new Date(2022, 2))).toEqual('Mar');
            expect(TimeUtility.getShortMonthString(new Date(2022, 3))).toEqual('Apr');
            expect(TimeUtility.getShortMonthString(new Date(2022, 4))).toEqual('May');
            expect(TimeUtility.getShortMonthString(new Date(2022, 5))).toEqual('Jun');
            expect(TimeUtility.getShortMonthString(new Date(2022, 6))).toEqual('Jul');
            expect(TimeUtility.getShortMonthString(new Date(2022, 7))).toEqual('Aug');
            expect(TimeUtility.getShortMonthString(new Date(2022, 8))).toEqual('Sep');
            expect(TimeUtility.getShortMonthString(new Date(2022, 9))).toEqual('Oct');
            expect(TimeUtility.getShortMonthString(new Date(2022, 10))).toEqual('Nov');
            expect(TimeUtility.getShortMonthString(new Date(2022, 11))).toEqual('Dec');
        });
    });

    describe('getDurationString', () => {
        test('should return correct month', () => {
            expect(TimeUtility.getDurationString(500)).toEqual('00:00:00');
            expect(TimeUtility.getDurationString(1000)).toEqual('00:00:01');
            expect(TimeUtility.getDurationString(1000 * 60)).toEqual('00:01:00');
            expect(TimeUtility.getDurationString(1000 * 60 * 60)).toEqual('01:00:00');
            expect(TimeUtility.getDurationString(1000 * 60 * 60 * 17 + 1000 * 60 * 5 + 1000 * 29)).toEqual('17:05:29');
        });
    });

    describe('getDateSuffix', () => {
        test('should return correct suffix', () => {
            expect(TimeUtility.getDateSuffix(1)).toEqual('st');
            expect(TimeUtility.getDateSuffix(2)).toEqual('nd');
            expect(TimeUtility.getDateSuffix(3)).toEqual('rd');
            expect(TimeUtility.getDateSuffix(4)).toEqual('th');
            expect(TimeUtility.getDateSuffix(5)).toEqual('th');
            expect(TimeUtility.getDateSuffix(6)).toEqual('th');
            expect(TimeUtility.getDateSuffix(7)).toEqual('th');
            expect(TimeUtility.getDateSuffix(8)).toEqual('th');
            expect(TimeUtility.getDateSuffix(9)).toEqual('th');
            expect(TimeUtility.getDateSuffix(10)).toEqual('th');
            expect(TimeUtility.getDateSuffix(11)).toEqual('th');
            expect(TimeUtility.getDateSuffix(12)).toEqual('th');
            expect(TimeUtility.getDateSuffix(13)).toEqual('th');
            expect(TimeUtility.getDateSuffix(14)).toEqual('th');
            expect(TimeUtility.getDateSuffix(15)).toEqual('th');
            expect(TimeUtility.getDateSuffix(16)).toEqual('th');
            expect(TimeUtility.getDateSuffix(17)).toEqual('th');
            expect(TimeUtility.getDateSuffix(18)).toEqual('th');
            expect(TimeUtility.getDateSuffix(19)).toEqual('th');
            expect(TimeUtility.getDateSuffix(20)).toEqual('th');
            expect(TimeUtility.getDateSuffix(21)).toEqual('st');
            expect(TimeUtility.getDateSuffix(22)).toEqual('nd');
            expect(TimeUtility.getDateSuffix(23)).toEqual('rd');
            expect(TimeUtility.getDateSuffix(24)).toEqual('th');
            expect(TimeUtility.getDateSuffix(25)).toEqual('th');
            expect(TimeUtility.getDateSuffix(26)).toEqual('th');
            expect(TimeUtility.getDateSuffix(27)).toEqual('th');
            expect(TimeUtility.getDateSuffix(28)).toEqual('th');
            expect(TimeUtility.getDateSuffix(29)).toEqual('th');
            expect(TimeUtility.getDateSuffix(30)).toEqual('th');
            expect(TimeUtility.getDateSuffix(31)).toEqual('st');
        });
    });
});
