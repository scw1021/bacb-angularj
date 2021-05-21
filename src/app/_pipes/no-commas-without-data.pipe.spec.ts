import { AddCommasIfDataExists } from './no-commas-without-data.pipe';

describe('NoCommasWithoutDataPipe', () => {
  it('create an instance', () => {
    const pipe = new AddCommasIfDataExists();
    expect(pipe).toBeTruthy();
  });
});
