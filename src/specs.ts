import { container } from './core/ioc/container';

beforeEach(() => {
    jest.useFakeTimers();
    container.snapshot();
});

afterEach(() => {
    jest.useRealTimers();
    container.restore();
});
