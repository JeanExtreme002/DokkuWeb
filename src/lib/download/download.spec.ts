import { downloadFile } from './download';

describe('downloadFile', () => {
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;
  let originalCreateElement: typeof document.createElement;
  let originalAppendChild: typeof document.body.appendChild;

  beforeAll(() => {
    global.URL = global.URL || {};
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = jest.fn(() => 'blob:url');
    URL.revokeObjectURL = jest.fn();

    originalCreateElement = document.createElement;
    originalAppendChild = document.body.appendChild;
  });

  afterAll(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
  });

  beforeEach(() => {
    // Mock <a> element
    const a = {
      set href(val: string) {},
      set download(val: string) {},
      click: jest.fn(),
      remove: jest.fn(),
    } as any;
    jest.spyOn(document, 'createElement').mockReturnValue(a);
    jest.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => node);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a blob, link, and trigger download', () => {
    downloadFile('test.txt', 'hello', 'text/plain');
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(document.body.appendChild).toHaveBeenCalled();

    // The <a> element is mocked, so we check if click and remove were called
    const a = (document.createElement as jest.Mock).mock.results[0].value;
    expect(a.click).toHaveBeenCalled();
    expect(a.remove).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');
  });

  it('should handle errors gracefully', () => {
    (document.createElement as jest.Mock).mockImplementationOnce(() => {
      throw new Error('fail');
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    downloadFile('test.txt', 'hello', 'text/plain');
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error downloading file:'),
      expect.any(Error)
    );
    errorSpy.mockRestore();
  });
});
