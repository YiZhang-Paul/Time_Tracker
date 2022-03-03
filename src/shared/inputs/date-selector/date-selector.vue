<template>
    <div class="date-selector-container" ref="container">
        <div class="current-date-wrapper" :class="{ active: showOptions }" @click="showOptions = !showOptions">
            <template v-if="selected">
                <span>{{ selectedMonthAndDate }}</span>
                <span class="date-suffix">{{ selectedDateSuffix }}</span>
                <span>, {{ selected.getFullYear() }}</span>
            </template>

            <span v-if="!selected">N/A</span>
        </div>

        <div v-if="showOptions" class="selection-panel">
            <div class="month-selection">
                <chevron-left class="page-arrow"
                    :class="{ 'disabled-arrow': !allowPreviousMonth }"
                    @click="showPreviousMonth()" />

                <span>{{ panelMonthAndYear }}</span>

                <chevron-right class="page-arrow"
                    :class="{ 'disabled-arrow': !allowNextMonth }"
                    @click="showNextMonth()" />

                <flat-button v-if="showTodayButton"
                    class="today-button"
                    @click="onTodaySelect()">

                    TODAY
                </flat-button>
            </div>

            <div class="day-headers">
                <div class="header"
                    v-for="(letter, index) in letters"
                    :key="index"
                    :style="{ 'animation-delay': 0.1 + Math.abs(3 - index) * 0.025 + 's' }">

                    <span>{{ letter }}</span>
                </div>
            </div>

            <div class="row" v-for="row in rows" :key="row">
                <div class="day"
                    v-for="column in 7"
                    :key="column"
                    :class="getDayOptionClasses(row, column)"
                    @click="onDateSelect(row, column)">

                    <span>{{ getDate(row, column).getDate() }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { ChevronLeft, ChevronRight } from 'mdue';

import { ClassConfigs } from '../../../core/models/generic/class-configs';
import { DomUtility } from '../../../core/utilities/dom-utility/dom-utility';
import { TimeUtility } from '../../../core/utilities/time-utility/time-utility';
import FlatButton from '../../../shared/buttons/flat-button/flat-button.vue';

class DateSelectorProp {
    public modelValue = prop<Date>({ default: null });
}

@Options({
    components: {
        ChevronLeft,
        ChevronRight,
        FlatButton
    },
    emits: [
        'update:modelValue'
    ]
})
export default class DateSelector extends Vue.with(DateSelectorProp) {
    public readonly letters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    public days = [31, -1, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    public panelDate = this.selected ? new Date(this.selected) : new Date();
    public showOptions = false;
    public rows = 0;
    private readonly locale = 'en-CA';
    private columnOffset = 0;
    private rowOffset = 0;

    get selected(): Date | null {
        return this.modelValue ? new Date(this.modelValue) : null;
    }

    get selectedMonthAndDate(): string {
        return this.selected ? `${TimeUtility.getShortMonthString(this.selected)} ${this.selected.getDate()}` : '';
    }

    get selectedDateSuffix(): string {
        return this.selected ? TimeUtility.getDateSuffix(this.selected.getDate()) : '';
    }

    get showTodayButton(): boolean {
        const now = new Date();

        return this.panelDate.getFullYear() !== now.getFullYear() || this.panelDate.getMonth() !== now.getMonth();
    }

    get allowPreviousMonth(): boolean {
        return this.panelDate.getFullYear() > 2010;
    }

    get allowNextMonth(): boolean {
        const now = new Date();

        return this.panelDate.getFullYear() < now.getFullYear() || this.panelDate.getMonth() < now.getMonth();
    }

    get panelMonthAndYear(): string {
        const month = TimeUtility.getShortMonthString(this.panelDate);

        return `${month.slice(0, 3)} ${this.panelDate.getFullYear()}`;
    }

    public created(): void {
        this.setConstraints();
    }

    public mounted(): void {
        document.addEventListener('click', this.checkClickOutside);
    }

    public beforeUnmount(): void {
        document.removeEventListener('click', this.checkClickOutside);
    }

    public getDayOptionClasses(row: number, column: number): ClassConfigs {
        const date = this.getDate(row, column);

        return {
            'unselectable-day': !this.isSelectable(date),
            today: new Date().toLocaleDateString(this.locale) === date.toLocaleDateString(this.locale),
            'selected-day': this.selected?.toLocaleDateString(this.locale) === date.toLocaleDateString(this.locale)
        };
    }

    public showPreviousMonth(): void {
        if (this.allowPreviousMonth) {
            const isYearStart = !this.panelDate.getMonth();
            const year = this.panelDate.getFullYear() - (isYearStart ? 1 : 0);
            const month = isYearStart ? 11 : this.panelDate.getMonth() - 1;
            this.panelDate = new Date(year, month);
            this.setConstraints();
        }
    }

    public showNextMonth(): void {
        if (this.allowNextMonth) {
            const isYearEnd = this.panelDate.getMonth() === 11;
            const year = this.panelDate.getFullYear() + (isYearEnd ? 1 : 0);
            const month = isYearEnd ? 0 : this.panelDate.getMonth() + 1;
            this.panelDate = new Date(year, month);
            this.setConstraints();
        }
    }

    public onTodaySelect(): void {
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        this.panelDate = new Date(today.getFullYear(), today.getMonth());
        this.setConstraints();
        this.$emit('update:modelValue', today);
    }

    public onDateSelect(row: number, column: number): void {
        const date = this.getDate(row, column);

        if (!this.isSelectable(date)) {
            return;
        }

        if (date.getTime() !== this.selected?.getTime()) {
            this.$emit('update:modelValue', date);
        }

        this.showOptions = false;
    }

    public getDate(row: number, column: number): Date {
        const [month, year] = [this.panelDate.getMonth(), this.panelDate.getFullYear()];
        const dayCount = (this.rowOffset + row - 1) * 7 + column;

        if (dayCount <= this.columnOffset) {
            return new Date(year - 1, 11, dayCount - this.columnOffset + this.days.slice(-1)[0]);
        }

        const dayOffset = dayCount - this.getPrefixSum(month);

        if (dayOffset <= 0) {
            return new Date(year, month - 1, this.days[month - 1] + dayOffset);
        }

        if (dayOffset <= this.days[month]) {
            return new Date(year, month, dayOffset);
        }

        if (month === 11) {
            return new Date(year + 1, 0, dayOffset - this.days[month]);
        }

        return new Date(year, month + 1, dayOffset - this.days[month]);
    }

    private isSelectable(date: Date): boolean {
        const [year, month] = [this.panelDate.getFullYear(), this.panelDate.getMonth()];

        if (date.getFullYear() !== year || date.getMonth() !== month) {
            return false;
        }

        const target = date.toLocaleDateString(this.locale);
        const current = new Date().toLocaleDateString(this.locale);

        return target <= current;
    }

    private setConstraints(): void {
        const [month, year] = [this.panelDate.getMonth(), this.panelDate.getFullYear()];
        this.days[1] = TimeUtility.isLeapYear(year) ? 29 : 28;
        this.columnOffset = new Date(year, 0, 1).getDay();
        this.rowOffset = Math.floor(this.getPrefixSum(month) / 7);
        this.rows = Math.floor((this.getPrefixSum(month + 1) - 1) / 7) - this.rowOffset + 1;
    }

    private getPrefixSum(month: number): number {
        return this.days.slice(0, month).reduce((total, _) => total + _, 0) + this.columnOffset;
    }

    private checkClickOutside(event: Event): void {
        if (DomUtility.isClickOutside(event, this.$refs.container as HTMLElement)) {
            this.showOptions = false;
        }
    }
}
</script>

<style lang="scss" scoped>
.date-selector-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    @include flex-row(initial, center);
    position: relative;

    .current-date-wrapper {
        @include flex-row(center);
        padding: 0.5vh 1.5vh;
        width: 100%;
        height: 100%;
        border-radius: 3px;
        background-color: var(--primary-colors-7-00);
        transition: background-color 0.3s;

        &:hover, &.active {
            cursor: pointer;
            background-color: var(--primary-colors-6-00);
        }

        .date-suffix {
            align-self: flex-start;
            margin-left: 0.1vh;
            font-size: var(--font-sizes-200);
        }
    }

    .selection-panel {
        $grid-gap: 1vh;
        $grid-dimension: var(--font-sizes-700);
        $selection-color: var(--context-colors-info-0-00);

        @include flex-column(center);
        position: absolute;
        z-index: 999;
        top: 130%;
        padding: 1.75vh 2vh 1.5vh 2vh;
        border-radius: 3px;
        background-color: var(--primary-colors-7-00);
        box-shadow: 0 0 6px 2px rgba(0, 0, 0, 0.35);
        @include animate-property(opacity, 0, 1, 0.2s);

        .month-selection {
            @include flex-row(center, center);
            position: relative;
            padding: 0 2vh;
            margin-bottom: 0.75vh;
            width: 100%;

            & > span {
                width: 45%;
                text-align: center;
            }

            .today-button {
                position: absolute;
                right: 5%;
                background-color: transparent;
                color: var(--context-colors-suggestion-1-00);
                font-size: var(--font-sizes-100);
                transition: color 0.3s;

                &:hover {
                    color: var(--context-colors-suggestion-0-00);
                }
            }

            .page-arrow {
                font-size: var(--font-sizes-500);
                transition: color 0.4s;

                &:hover {
                    cursor: pointer;
                    color: $selection-color;
                }

                &.disabled-arrow, &.disabled-arrow:hover {
                    cursor: default;
                    color: var(--context-colors-disabled-0-00);
                }
            }
        }

        .day-headers, .row {
            @include flex-row(initial, space-between);
            width: 100%;
        }

        .day-headers {
            margin-bottom: $grid-gap;
            height: $grid-dimension;

            .header {
                @include flex-row(center, center);
                padding: 0.5vh;
                width: $grid-dimension;
                height: $grid-dimension;
                color: var(--context-colors-info-1-00);
                @include animate-property(opacity, 0, 1, 0.2s);

                &:not(:first-of-type) {
                    margin-left: $grid-gap;
                }

                &:nth-child(1), &:nth-last-child(1) {
                    color: var(--context-colors-suggestion-0-00);
                }
            }
        }

        .row {
            margin-bottom: $grid-gap;
            @include animate-property(opacity, 0, 1, 0.3s, 0.1s);

            .day {
                @include flex-row(center, center);
                padding: 0.5vh;
                width: $grid-dimension;
                min-width: $grid-dimension;
                height: $grid-dimension;
                min-height: $grid-dimension;
                border-radius: 50%;
                transition: background-color 0.3s, color 0.1s;

                &:not(:first-of-type) {
                    margin-left: 0.75vh;
                }

                &:not(.unselectable-day):hover {
                    cursor: pointer;
                    background-color: $selection-color;
                }

                &.today {
                    color: var(--context-colors-suggestion-0-00);
                }

                &.unselectable-day {
                    color: var(--font-colors-4-00);
                    transition: none;
                }

                &.selected-day {
                    background-color: $selection-color;
                    color: var(--font-colors-9-00);
                }
            }
        }
    }
}
</style>
