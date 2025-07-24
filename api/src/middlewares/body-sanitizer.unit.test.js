import { bodySanitizerMiddleware } from "./body-sanitizer";
import httpMocks from "node-mocks-http";
import { jest } from "@jest/globals";

describe('bodySanitizerMiddleware()', () => {
  test('Sanitize body', () => {
    const req = httpMocks.createRequest({
      body: {
        title: '<span class="test-class">hello world</span>',
        description: '<p id="test-id">Hello!</p>'
      }
    });

    bodySanitizerMiddleware(req, {}, jest.fn());

    expect(req.body.title).toEqual('<span>hello world</span>');
    expect(req.body.description).toEqual('<p>Hello!</p>');
  })
});