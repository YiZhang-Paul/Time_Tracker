import { container } from './core/ioc/container';

beforeEach(() => {
    jest.useFakeTimers();
    container.snapshot();
});

afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    container.restore();
});
